import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Platform } from 'react-native';
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
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

  // 🔁 Ensure user stays in sync after login
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  // ✅ Register push token after user is set
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

      // Save the push token to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        pushToken: token,
      }, { merge: true });

      console.log('Push token saved:', token);
    };

    registerPushToken();
  }, [user]);

  // 🔥 Load friends list
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

  const triggerBeacon = () => {
    friends.forEach((friend) => {
      console.log(`Notify ${friend.name} at ${friend.value} via ${friend.method}`);
      // Push logic to be added next
    });
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
