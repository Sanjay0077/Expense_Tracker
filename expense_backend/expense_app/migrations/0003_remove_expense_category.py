# Generated by Django 5.1.7 on 2025-04-03 11:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('expense_app', '0002_alter_expense_expense_type_bill_notification_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='expense',
            name='category',
        ),
    ]
