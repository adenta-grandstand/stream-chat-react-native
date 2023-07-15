import React, { PropsWithChildren } from 'react';
import { Chat, OverlayProvider, Streami18n, registerNativeHandlers } from 'stream-chat-expo';
import { useChatClient } from '../hooks/useChatClient';
import { AuthProgressLoader } from './AuthProgressLoader';
import { StreamChatGenerics } from '../types';
import { STREAM_API_KEY, user, userToken } from '../constants';
import { Video } from 'expo-av';
const streami18n = new Streami18n({
  language: 'en',
});

export const ChatWrapper = ({ children }: PropsWithChildren<{}>) => {
  const chatClient = useChatClient({
    apiKey: STREAM_API_KEY,
    userData: user,
    tokenOrProvider: userToken,
  });

  React.useEffect(() => {
    registerNativeHandlers({
      Video: (props) => {
        const { onPlaybackStatusUpdate, paused, resizeMode, style, uri, videoRef, onLoad } = props;
        const [touched, setTouched] = React.useState<boolean>(false);
        return (
          <Video
            onPlaybackStatusUpdate={(props) => {
              if (props.isLoaded && paused && !touched) {
                videoRef.current.setStatusAsync({ shouldPlay: true });
                setTouched(true);
              }
              onPlaybackStatusUpdate(props);
            }}
            ref={videoRef}
            resizeMode={resizeMode}
            shouldPlay={!paused}
            source={{
              uri,
            }}
            style={[style]}
          />
        );
      },
    });
  }, []);

  if (!chatClient) {
    return <AuthProgressLoader />;
  }

  return (
    <OverlayProvider<StreamChatGenerics> i18nInstance={streami18n}>
      <Chat client={chatClient} i18nInstance={streami18n} enableOfflineSupport={true}>
        {children}
      </Chat>
    </OverlayProvider>
  );
};
