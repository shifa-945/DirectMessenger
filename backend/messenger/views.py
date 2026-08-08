from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status, viewsets
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    UserListSerializer,
    ChatSerializer,
    MessageSerializer,
)
from .models import Chat, Message


class RegisterAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Registration successful"},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class LoginAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {
                    "error": "Invalid username or password"
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "username": user.username,
                "user_id": user.id,
            },
            status=status.HTTP_200_OK,
        )

class UserListAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(
            is_superuser=False,
            is_staff=False,
        ).exclude(id=request.user.id)

        serializer = UserListSerializer(
            users,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)
    

class ChatViewSet(viewsets.ModelViewSet):

    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

    def get_queryset(self):

        user = self.request.user

        return Chat.objects.filter(
            user1=user
        ) | Chat.objects.filter(
            user2=user
        )


    def create(self, request, *args, **kwargs):

        user1 = request.user
        user2_id = request.data.get("user2")

        user2 = User.objects.get(id=user2_id)

        chat = Chat.objects.filter(
            user1=user1,
            user2=user2
        ).first()

        if not chat:
            chat = Chat.objects.filter(
                user1=user2,
                user2=user1
            ).first()

        if not chat:
            chat = Chat.objects.create(
                user1=user1,
                user2=user2
            )

        serializer = ChatSerializer(chat)

        return Response(serializer.data)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        queryset = Message.objects.all().order_by("created_at")

        chat = self.request.query_params.get("chat")

        if chat:
            queryset = queryset.filter(chat_id=chat)

        return queryset

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)