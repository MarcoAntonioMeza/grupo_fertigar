# Generated by Django 4.2.21 on 2025-06-23 17:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_user_telefono_alter_user_created_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='tipo',
            field=models.PositiveSmallIntegerField(choices=[(10, 'Administrador'), (20, 'Usuario'), (30, 'Agente')], default=20, verbose_name='Tipo de Usuario'),
        ),
    ]
