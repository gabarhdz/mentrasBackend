import apps.user.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("user", "0008_user_code_expires_at_alter_user_code"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="code_expires_at",
            field=models.DateTimeField(
                blank=True,
                default=apps.user.models.get_code_expiry,
                null=True,
            ),
        ),
    ]
