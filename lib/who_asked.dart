import 'package:nyxx/nyxx.dart';

final pattern = RegExp(r'who (\w+ ){0,2}asked');

class WhoAsked extends NyxxPlugin<NyxxGateway> {
  @override
  String get name => 'WhoAsked';

  @override
  void afterConnect(NyxxGateway client) {
    client.onMessageCreate.listen((event) async {
      if (pattern.hasMatch(event.message.content)) {
        await event.message.channel.sendMessage(MessageBuilder(
          content: 'https://www.youtube.com/watch?v=83amztBl9Qk&t=211s',
        ));
      }
    });
  }
}
