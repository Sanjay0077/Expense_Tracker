# Generated by Django 5.2 on 2025-07-01 12:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expense_app', '0017_alter_expense_expense_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='price',
            field=models.FloatField(default=0),
        ),
    ]
