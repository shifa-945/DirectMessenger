from channels.generic.websocket import AsyncWebsocketConsumer
import json

from channels.db import database_sync_to_async
from .models import Message, Chat
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print("CONNECT CALLED")

        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]

        self.room_group_name = f"chat_{self.chat_id}"

        print("Query:", self.scope["query_string"])
        print("User:", self.scope["user"])

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        print("Connected:", self.room_group_name)

    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        print("Disconnected")

    async def receive(self, text_data):
        print("receive() called")

        print("Raw data:", text_data)

        data = json.loads(text_data)

        print("JSON:", data)

        query_params = parse_qs(
            self.scope["query_string"].decode()
        )

        user_id = query_params.get("user_id", [None])[0]

        print("User ID:", user_id)

        user = await database_sync_to_async(
            User.objects.get
        )(id=user_id)

        print("User:", user)

        # =========================
        # TYPING STATUS
        # =========================

        if data.get("type") == "typing":

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_status",
                    "sender": user.id,
                    "sender_name": user.username,
                    "is_typing": data.get("is_typing", False),
                }
            )

            return

        # =========================
        # NORMAL MESSAGE
        # =========================

        message_text = data["message"]

        print("Message:", message_text)

        message = await self.save_message(
            user,
            self.chat_id,
            message_text
        )

        print("Saved")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message.message,
                "sender": user.id,
                "sender_name": user.username,
            }
        )

        # =========================
        # NOTIFICATION
        # =========================

        chat = await self.get_chat(self.chat_id)

        if chat.user1_id == user.id:
            receiver_id = chat.user2_id
        else:
            receiver_id = chat.user1_id

        await self.channel_layer.group_send(
            f"user_{receiver_id}",
            {
                "type": "new_notification",
                "sender": user.id,
                "sender_name": user.username,
                "message": message.message,
                "chat_id": int(self.chat_id),
            }
        )

    # =========================
    # CHAT MESSAGE
    # =========================

    async def chat_message(self, event):

        await self.send(
            text_data=json.dumps({
                "message": event["message"],
                "sender": event["sender"],
                "sender_name": event["sender_name"]
            })
        )

    # =========================
    # TYPING STATUS
    # =========================

    async def typing_status(self, event):

        await self.send(
            text_data=json.dumps({
                "type": "typing",
                "sender": event["sender"],
                "sender_name": event["sender_name"],
                "is_typing": event["is_typing"],
            })
        )

    # =========================
    # SAVE MESSAGE
    # =========================

    @database_sync_to_async
    def save_message(self, user, chat_id, text):

        print("save_message() called")

        chat = Chat.objects.get(id=chat_id)

        message = Message.objects.create(
            chat=chat,
            sender=user,
            message=text
        )

        return message

    # =========================
    # GET CHAT
    # =========================

    @database_sync_to_async
    def get_chat(self, chat_id):

        return Chat.objects.get(id=chat_id)


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]

        self.notification_group_name = f"user_{self.user_id}"

        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )

        await self.accept()

        print(
            "Notification connected:",
            self.notification_group_name
        )

    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.notification_group_name,
            self.channel_name
        )

        print("Notification disconnected")

    async def new_notification(self, event):

        await self.send(
            text_data=json.dumps({
                "type": "new_message",
                "sender": event["sender"],
                "sender_name": event["sender_name"],
                "message": event["message"],
                "chat_id": event["chat_id"],
            })
        )

