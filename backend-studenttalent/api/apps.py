from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        # Ensure development seed data is registered when migrations run.
        import api.seed  # noqa: F401
