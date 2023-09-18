import 'package:nyxx/nyxx.dart';

final codeUnitA = 'a'.codeUnitAt(0);
final codeUnitZ = 'z'.codeUnitAt(0);

class Alphabet extends NyxxPlugin<NyxxGateway> {
  @override
  String get name => 'Alphabet';

  @override
  void afterConnect(NyxxGateway client) {
    client.onMessageCreate.listen((event) async {
      int currentCodeUnit = codeUnitA;

      final stopwatch = Stopwatch()..start();

      var content = event.message.content;
      while (content.isNotEmpty &&
          !content.toLowerCase().codeUnits.any((element) => element != currentCodeUnit)) {
        var response = String.fromCharCode(++currentCodeUnit) * content.length;

        if (content.toLowerCase() != content) {
          response = response.toUpperCase();
        }

        event.message.channel.sendMessage(MessageBuilder(content: response));

        currentCodeUnit++;
        if (currentCodeUnit > codeUnitZ) break;

        try {
          final newEvent = await client.onMessageCreate.firstWhere(
            (newEvent) =>
                newEvent.message.author.id == event.message.author.id &&
                newEvent.message.channelId == event.message.channelId,
          );

          content = newEvent.message.content;
        } on StateError {
          return;
        }
      }

      if (currentCodeUnit == codeUnitA) return;

      if (currentCodeUnit > codeUnitZ) {
        if (stopwatch.elapsed < Duration(seconds: 5)) {
          await event.message.channel.sendMessage(MessageBuilder(
            content: 'ok well now i know you copy pasted that',
          ));
        } else if (stopwatch.elapsed < Duration(seconds: 10)) {
          await event.message.channel.sendMessage(MessageBuilder(
            content: 'wow you really have no life grinding a stupid alphabet game with a bot on'
                ' discord, now you got under 10 seconds gg well played go get your fast boi role',
          ));
        } else if (stopwatch.elapsed > Duration(days: 1)) {
          await event.message.channel.sendMessage(MessageBuilder(
            content: 'not sure i even want to comment on this',
          ));
        } else if (stopwatch.elapsed > Duration(minutes: 5)) {
          await event.message.channel.sendMessage(MessageBuilder(
            content: 'how did it take you so long to get here...',
          ));
        }

        return;
      }

      if (content.length > 3) return;

      await event.message.channel.sendMessage(MessageBuilder(
        content: '**Your streak was broken**\n*You stoopid*',
      ));
    });
  }
}
