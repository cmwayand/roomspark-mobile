import { Link, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, StyleSheet, Image, ImageBackground } from 'react-native';
import React, { useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import { useSSO } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/src/constants/Colors';
import { useWarmUpBrowser } from '@/src/lib/utils/browserUtils';
import { createOAuthRedirectUrl, setupDeepLinkHandler } from '@/src/lib/utils/oauthUtils';

export default function LandingPage() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Handle deep link for OAuth callback
  useEffect(() => {
    const cleanup = setupDeepLinkHandler(url => {
      // Additional handling if needed
      console.log('OAuth deep link handled:', url);
    });

    return cleanup;
  }, []);

  const onSignInWithGoogle = async () => {
    try {
      const redirectUrl = createOAuthRedirectUrl();

      console.log('Using redirect URL:', redirectUrl);

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      console.log('createdSessionId', createdSessionId);
      console.log('setActive', setActive);

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/');
      } else {
        console.log('Session creation failed - this usually means OAuth redirect URL mismatch');
        console.log('Make sure your Clerk OAuth settings include:', redirectUrl);
      }
    } catch (err) {
      console.error('OAuth Error:', JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />

      {/* Background image extending to full screen */}
      <View style={styles.backgroundContainer}>
        <ImageBackground
          source={require('../../../assets/images/landingbg.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0.3)',
              'rgba(0, 0, 0, 0.1)',
              'rgba(255, 255, 255, 0)',
              'rgba(255, 255, 255, 0.5)',
              'white',
            ]}
            style={styles.gradient}
            locations={[0, 0.2, 0.5, 0.8, 1]}
          />
        </ImageBackground>
      </View>

      {/* Content section with safe area padding */}
      <View
        style={[
          styles.contentSection,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
      >
        <View style={styles.spacer} />

        <Image
          source={require('../../../assets/images/roomsparklogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.tagline}>Transform your space with AI-powered design</Text>

        <TouchableOpacity onPress={onSignInWithGoogle} style={styles.googleButton}>
          <Image
            source={require('../../../assets/images/google-icon.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <Link href="/sign-in" asChild>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/sign-up" asChild>
          <TouchableOpacity style={styles.signupButton}>
            <Text style={styles.signupButtonText}>Sign up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  logo: {
    width: '80%',
    height: 100,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#1a1a1a',
    lineHeight: 36,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  loginButtonText: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    width: '100%',
  },
  signupButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 32,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '500',
  },
});
