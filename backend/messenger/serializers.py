from rest_framework import serializers
from django.contrib.auth.models import User
from .models import  Chat, Message

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True
    )


    class Meta:
        model = User

        fields = [
            "username",
            "email",
            "password"
        ]


    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )

        return user



class UserListSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username"]


class ChatSerializer(serializers.ModelSerializer):

    user1_name = serializers.CharField(
        source="user1.username",
        read_only=True
    )

    user2_name = serializers.CharField(
        source="user2.username",
        read_only=True
    )

    class Meta:
        model = Chat
        fields = [
            "id",
            "user1",
            "user2",
            "user1_name",
            "user2_name",
            "created_at",
        ]

        read_only_fields = [
            "user1",
            "user1_name",
            "created_at",
        ]




class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(
        source="sender.username",
        read_only=True
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "chat",
            "sender",
            "sender_name",
            "message",
            "is_read",
            "created_at",
        ]

        read_only_fields = [
            "sender",
            "sender_name",
            "created_at",
        ]