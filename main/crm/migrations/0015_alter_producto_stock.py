# Generated by Django 4.2.21 on 2025-06-18 16:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0014_agente_apellidos_agente_email_agente_imagen_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='producto',
            name='stock',
            field=models.DecimalField(blank=True, decimal_places=3, default=0, max_digits=10, verbose_name='Stock Global'),
        ),
    ]
