import 'dart:async';
import 'dart:math';

import 'package:nyxx/nyxx.dart';

// ignore: implementation_imports
import 'package:nyxx/src/plugin/plugin.dart';

const interval = Duration(seconds: 30);

final statuses = [
  PresenceBuilder(
    status: CurrentUserStatus.online,
    isAfk: false,
    activities: [
      ActivityBuilder(
        name: 'your life in 4K',
        type: ActivityType.streaming,
        url: Uri.parse('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      ),
    ],
  ),
  PresenceBuilder(
    status: CurrentUserStatus.online,
    isAfk: false,
    activities: [
      ActivityBuilder(
        name: 'your every move',
        type: ActivityType.listening,
      ),
    ],
  ),
  PresenceBuilder(
    status: CurrentUserStatus.dnd,
    isAfk: false,
    activities: [
      ActivityBuilder(
        name: 'tsundere mode activated',
        type: ActivityType.game,
      ),
    ],
  ),
  PresenceBuilder(
    status: CurrentUserStatus.online,
    isAfk: false,
    activities: [
      ActivityBuilder(
        name: 'streaming streaming streaming streaming streaming streaming streaming streaming...',
        type: ActivityType.streaming,
        url: Uri.parse('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      ),
    ],
  ),
  PresenceBuilder(
    status: CurrentUserStatus.online,
    isAfk: false,
    activities: [
      ActivityBuilder(
        name: 'a b c d e f g h i j k l m n o p q r s t u v w x y z',
        type: ActivityType.game,
      ),
    ],
  ),
  PresenceBuilder(
    status: CurrentUserStatus.online,
    isAfk: false,
    activities: [
      ActivityBuilder(
        name: 'calculating the chances of a chinese cat taking over the internet',
        type: ActivityType.competing,
      ),
    ],
  ),
  PresenceBuilder(
    status: CurrentUserStatus.online,
    isAfk: false,
    activities: [
      ActivityBuilder(
        name: 'wazzup beijing on loop',
        type: ActivityType.watching,
        url: Uri.parse('https://www.youtube.com/watch?v=TE1pcyHCFUE'),
      ),
    ],
  ),
  PresenceBuilder(
    status: CurrentUserStatus.online,
    isAfk: false,
    activities: [
      ActivityBuilder(
        name: 'Overwatch 4',
        type: ActivityType.game,
      ),
    ],
  ),
  PresenceBuilder(
    status: CurrentUserStatus.online,
    isAfk: false,
    activities: [
      ActivityBuilder(
        name: 'Discord',
        type: ActivityType.game,
      ),
    ],
  ),
  PresenceBuilder(
    status: CurrentUserStatus.online,
    isAfk: false,
    activities: [
      ActivityBuilder(
        name: '#feet-pics',
        type: ActivityType.streaming,
      ),
    ],
  ),
];

class RotatingStatus extends NyxxPlugin<NyxxGateway> {
  @override
  String get name => 'RotatingStatus';

  @override
  NyxxPluginState<NyxxGateway, RotatingStatus> createState() => _RotatingStatusState(this);
}

class _RotatingStatusState extends NyxxPluginState<NyxxGateway, RotatingStatus> {
  Timer? timer;

  _RotatingStatusState(super.plugin);

  @override
  void afterConnect(NyxxGateway client) {
    super.afterConnect(client);

    final random = Random();

    void setStatus() {
      final status = statuses[random.nextInt(statuses.length)];

      client.updatePresence(status);
    }

    setStatus();
    timer = Timer.periodic(interval, (_) => setStatus());
  }

  @override
  void beforeClose(NyxxGateway client) {
    super.beforeClose(client);

    timer?.cancel();
  }
}
