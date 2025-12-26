from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_profile_is_active'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""ALTER TABLE api_user ADD COLUMN IF NOT EXISTS photo_profile TEXT;""",
            reverse_sql="""ALTER TABLE api_user DROP COLUMN IF EXISTS photo_profile;""",
        ),
    ]
