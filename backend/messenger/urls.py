from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterAPI,
    LoginAPI,
    UserListAPI,
    ChatViewSet,
    MessageViewSet,
)

router = DefaultRouter()
router.register("chats", ChatViewSet)
router.register("messages", MessageViewSet)

urlpatterns = [
    path("register/", RegisterAPI.as_view(), name="register"),
    path("login/", LoginAPI.as_view(), name="login"),
    path("users/", UserListAPI.as_view(), name="users"),
    path("", include(router.urls)),
]