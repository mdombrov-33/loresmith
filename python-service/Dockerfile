FROM python:3.12-slim

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false

RUN poetry install --only main --no-root --no-interaction --no-ansi

RUN python -m spacy download en_core_web_sm

COPY . .

EXPOSE 50051

CMD ["python", "lore_servicer.py"]