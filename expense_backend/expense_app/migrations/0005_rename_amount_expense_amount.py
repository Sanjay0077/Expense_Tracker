# Generated by Django 5.1.7 on 2025-04-04 07:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('expense_app', '0004_expense_amount'),
    ]

    operations = [
        migrations.RenameField(
            model_name='expense',
            old_name='Amount',
            new_name='amount',
        ),
    ]
