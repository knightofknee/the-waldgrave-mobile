import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Platform } from 'react-native';
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc, getDocs, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';
import EditRecipientsModal from '@/components/EditRecipientsModal';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

interface Friend {
  id: string;
  name: string;
  value: string;
  method: 'email' | 'phone';
}

export default function MainScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const registerPushToken = async () => {
      if (!user || !Device.isDevice) return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      const tokenResponse = await Notifications.getExpoPushTokenAsync();
      const token = tokenResponse.data;

      await setDoc(doc(db, 'users', user.uid), {
        pushToken: token,
      }, { merge: true });

      console.log('Push token saved:', token);
    };

    registerPushToken();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;
    const friendsRef = collection(db, 'users', uid, 'friends');

    const unsubscribe = onSnapshot(
      friendsRef,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Friend[];
        setFriends(list);
      },
      (error) => {
        console.error('Failed to fetch friends:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const openEditModal = () => {
    if (!user) return;
    setModalVisible(true);
  };

  const handleAddFriend = async (newFriend: Omit<Friend, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'friends'), newFriend);
      console.log('Friend added!');
    } catch (err) {
      console.error('Error adding friend:', err);
    }
  };

  const handleRemoveFriend = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'friends', id));
      console.log('Friend removed!');
    } catch (err) {
      console.error('Error removing friend:', err);
    }
  };

  const sendPushNotification = async (token: string, message: string) => {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title: '⚠️ Beacon Triggered',
        body: message,
      }),
    });
  };

  const triggerBeacon = async () => {
    if (!user) return;

    const allUsersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = allUsersSnapshot.docs.map((docSnap) => ({
      uid: docSnap.id,
      ...(docSnap.data() as { email?: string; phone?: string }),
    }));

    const unreachable: Friend[] = [];

    for (const friend of friends) {
      const value = friend.value.trim().toLowerCase();

      const basicMatch = allUsers.find((u) =>
        u.email?.toLowerCase() === value || u.phone?.trim() === value
      );

      console.log("Matched basic user:", basicMatch?.email || basicMatch?.phone || 'none');

      if (!basicMatch) {
        unreachable.push(friend);
        continue;
      }

      // Load the full user doc now that we know the UID
      const fullUserDocRef = doc(db, 'users', basicMatch.uid);
      const fullUserSnap = await getDoc(fullUserDocRef);

      if (!fullUserSnap.exists()) {
        console.error('User doc unexpectedly missing:', basicMatch.uid);
        unreachable.push(friend);
        continue;
      }

      const fullUser = fullUserSnap.data();

      const hasValidPush =
        typeof fullUser.pushToken === 'string' &&
        fullUser.pushToken.startsWith('ExponentPushToken');

      const notificationsAllowed = fullUser.notificationsEnabled !== false;
      console.log('Pushhhhhhhhh:', fullUser);
      if (hasValidPush && notificationsAllowed) {
        try {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: fullUser.pushToken,
              sound: 'default',
              title: '⚠️ Beacon Triggered',
              body: `${user.email} lit the beacon!`,
            }),
          });
          console.log(`✅ Sent to ${friend.name}`);
        } catch (err) {
          console.error('Push send failed for:', friend.value, err);
          unreachable.push(friend);
        }
      } else {
        console.log('❌ No valid push token or disabled:', friend.name);
        unreachable.push(friend);
      }
    }

    if (unreachable.length > 0) {
      console.log('Unreachable contacts:');
      unreachable.forEach((f) =>
        console.log(`- ${f.name}: ${f.value} (${f.method})`)
      );
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Light The Beacon" onPress={triggerBeacon} color="#dc3545" />
      <Button title="Edit Recipients" onPress={openEditModal} />
      <EditRecipientsModal
        visible={modalVisible}
        friends={friends}
        onClose={() => setModalVisible(false)}
        onAddFriend={(newFriend) => {
          const typedFriend: Omit<Friend, 'id'> = {
            ...newFriend,
            method: newFriend.method as 'email' | 'phone',
          };
          handleAddFriend(typedFriend).catch((err) =>
            console.error('Error in onAddFriend:', err)
          );
        }}
        onRemoveFriend={handleRemoveFriend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});
