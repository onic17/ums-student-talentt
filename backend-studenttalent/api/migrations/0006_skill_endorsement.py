from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0005_user_photo_profile"),
    ]

    operations = [
        migrations.CreateModel(
            name="SkillEndorsement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("endorser", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="skill_endorsements", to="api.user")),
                ("profile_skill", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="endorsements", to="api.profileskill")),
            ],
            options={
                "unique_together": {("profile_skill", "endorser")},
            },
        ),
    ]
