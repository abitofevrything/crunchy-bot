FROM dart:stable

WORKDIR /bot

# Install dependencies
COPY pubspec.* /bot/
RUN dart pub get

# Copy code
COPY . /bot/
RUN dart pub get --offline

# Compile bot into executable
RUN dart run nyxx_commands:compile --compile -o crunchy-bot.g.dart --no-compile bin/crunchy-bot.dart
RUN dart compile exe -o crunchy-bot crunchy-bot.g.dart

CMD [ "./crunchy-bot" ]
