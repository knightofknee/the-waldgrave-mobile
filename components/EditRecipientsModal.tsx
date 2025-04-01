import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface Friend {
  id: string;
  name: string;
  method: string; // "email" or "phone"
  value: string;
}

interface EditRecipientsModalProps {
  visible: boolean;
  friends: Friend[];
  onClose: () => void;
  onAddFriend: (newFriend: Omit<Friend, 'id'>) => void;
  onRemoveFriend?: (id: string) => void;
}

const EditRecipientsModal: React.FC<EditRecipientsModalProps> = ({
  visible,
  friends,
  onClose,
  onAddFriend,
  onRemoveFriend,
}) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const trimmedValue = value.trim();
    const normalizedValue = trimmedValue.toLowerCase();

    if (!name.trim() || !normalizedValue) return;

    const isDuplicate = friends.some(f => f.value === normalizedValue);
    if (isDuplicate) {
      alert('This contact is already added.');
      return;
    }

    const isPhone = /^\d+$/.test(normalizedValue.replace(/\D/g, ''));
    const method: 'email' | 'phone' = isPhone ? 'phone' : 'email';

    onAddFriend({ name: name.trim(), method, value: normalizedValue });
    setName('');
    setValue('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.modalWrapper}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Edit Friends</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            {/* Scrollable Friends List */}
            <ScrollView
              style={styles.listArea}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {friends.map((friend) => (
                <View key={friend.id} style={styles.contactItem}>
                  <View>
                    <Text style={styles.contactName}>{friend.name}</Text>
                    <Text style={styles.contactInfo}>
                      {friend.value} ({friend.method})
                    </Text>
                  </View>
                  {onRemoveFriend && (
                    <Pressable onPress={() => onRemoveFriend(friend.id)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
                autoCapitalize="words"
                style={styles.input}
              />
              <Text style={styles.label}>Email or Phone</Text>
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder="example@email.com or 555-555-5555"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <View style={styles.buttonRow}>
                <Button title="Add Friend" onPress={handleAdd} />
                <View style={styles.buttonSpacer} />
                <Button title="Close" onPress={onClose} color="#6c757d" />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default EditRecipientsModal;

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeText: {
    fontSize: 22,
    color: '#999',
    padding: 4,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
  },
  listArea: {
    flexGrow: 0,
    maxHeight: 200,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  contactName: {
    fontWeight: '600',
    fontSize: 16,
  },
  contactInfo: {
    color: '#555',
    fontSize: 14,
    marginTop: 2,
  },
  removeText: {
    color: '#d9534f',
    fontWeight: '500',
    fontSize: 14,
  },
  inputSection: {
    paddingBottom: 24,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSpacer: {
    width: 10,
  },
});
