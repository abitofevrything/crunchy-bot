import 'package:nyxx/nyxx.dart';
import 'package:nyxx_commands/nyxx_commands.dart';

final ping = ChatCommand(
  'ping',
  'What do you even think this does',
  id('ping', (ChatContext context) async {
    String formatMs(Duration d) =>
        '${(d.inMicroseconds / Duration.microsecondsPerMillisecond).toStringAsFixed(2)}ms';

    await context.respond(MessageBuilder(
      embeds: [
        EmbedBuilder(
          fields: [
            EmbedFieldBuilder(
              name: 'Ping',
              value: formatMs(context.client.httpHandler.latency),
              isInline: true,
            ),
            EmbedFieldBuilder(
              name: 'Real ping',
              value: formatMs(context.client.httpHandler.realLatency),
              isInline: true,
            ),
            EmbedFieldBuilder(
              name: 'Gateway latency',
              value: formatMs(context.client.gateway.latency),
              isInline: true,
            ),
          ],
        ),
      ],
    ));
  }),
);
