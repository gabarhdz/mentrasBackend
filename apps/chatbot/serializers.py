from rest_framework import serializers


class ChatbotMessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=2000, allow_blank=False, trim_whitespace=True)
    history = serializers.ListField(required=False, allow_empty=True, max_length=12)

    def validate_history(self, value):
        normalized_history = []
        for entry in value:
            if not isinstance(entry, dict):
                raise serializers.ValidationError("Each history entry must be an object.")
            role = entry.get("role")
            content = entry.get("content")
            if role not in {"user", "assistant"} or not isinstance(content, str) or not content.strip():
                raise serializers.ValidationError("History entries must include a valid role and content.")
            normalized_history.append({"role": role, "content": content[:2000].strip()})
        return normalized_history
