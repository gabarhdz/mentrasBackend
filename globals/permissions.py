from rest_framework import permissions

class IsEmailVerified(permissions.BasePermission):
    """
    Custom permission to only allow access to users with verified email addresses.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.email_verified
    
    def has_object_permission(self, request, view, obj):
        return super().has_object_permission(request, view, obj)