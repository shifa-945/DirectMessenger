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

        message_text = data["message"]

        print("Message:", message_text)

        query_params = parse_qs(self.scope["query_string"].decode())
        user_id = query_params.get("user_id", [None])[0]

        print("User ID:", user_id)

        user = await database_sync_to_async(User.objects.get)(id=user_id)

        print("User:", user)

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

    async def chat_message(self, event):

        await self.send(

            text_data=json.dumps({

                "message": event["message"],
                "sender": event["sender"],
                "sender_name": event["sender_name"]

            })

        )

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