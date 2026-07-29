#!/bin/bash
# Запускать каждую минуту через cron:
# * * * * * /path/to/app/scripts/cleanup-expired-orders.sh >> /var/log/cleanup-orders.log 2>&1

SITE_URL="https://долинамолока.рф"
SECRET="9a68aa33e23f8ba189c3ce0ef26cc2c74a31df2a408b284f6b76e4420f1e393d"

curl -s -X POST "$SITE_URL/api/payment/cleanup" \
  -H "x-cleanup-secret: $SECRET" \
  -H "Content-Type: application/json" \
  --max-time 30 \
  -o /dev/null
