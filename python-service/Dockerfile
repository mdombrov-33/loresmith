FROM python:3.12-slim

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false

RUN poetry install --no-dev --no-interaction --no-ansi

COPY . .

EXPOSE 5000

CMD ["python", "loresmith-python-service.py"]