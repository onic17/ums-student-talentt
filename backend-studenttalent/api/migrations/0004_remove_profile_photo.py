from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_user_photo_profile"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="profile",
            name="photo",
        ),
    ]
