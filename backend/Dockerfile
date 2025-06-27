FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Create a startup script that seeds data and starts the server
RUN echo '#!/bin/bash\npython seed_demo_data.py\nuvicorn main:app --host 0.0.0.0 --port 8000' > /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"] 