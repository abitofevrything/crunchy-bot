import 'dart:io';

import 'package:crunchy_bot/alphabet.dart';
import 'package:crunchy_bot/commands/ping.dart';
import 'package:crunchy_bot/rotating_status.dart';
import 'package:crunchy_bot/who_asked.dart';
import 'package:nyxx/nyxx.dart';
import 'package:nyxx_commands/nyxx_commands.dart';

void main() async {
  final commands = CommandsPlugin(
    prefix: mentionOr((_) => '!'),
  );

  commands.addCommand(ping);

  await Nyxx.connectGateway(
    Platform.environment['TOKEN']!,
    GatewayIntents.allUnprivileged | GatewayIntents.messageContent,
    options: GatewayClientOptions(
      plugins: [
        // Base plugins
        cliIntegration,
        Logging(logLevel: Level.FINE),

        // Custom plugins
        commands,
        RotatingStatus(),
        WhoAsked(),
        Alphabet(),
      ],
    ),
  );
}
