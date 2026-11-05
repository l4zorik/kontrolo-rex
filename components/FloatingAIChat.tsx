import React, { useState } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';

type Message = { role: 'agent' | 'user'; text: string };
type Props = { onBuildReady: () => void };

export default function FloatingAIChat({ onBuildReady }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', text: 'Napiš, jakou změnu chceš připravit. Tohle je ukázka budoucího spojení s cloud agenty.' },
  ]);

  const send = () => {
    const request = draft.trim();
    if (!request || busy) return;
    setMessages(current => [
      ...current,
      { role: 'user', text: request },
      { role: 'agent', text: 'Demo: požadavek by se odeslal cloud agentům. Skutečné cloudové odeslání zatím není připojené.' },
    ]);
    setDraft('');
    setBusy(true);
    setTimeout(() => {
      setMessages(current => [...current, { role: 'agent', text: 'Demo build dokončen. V seznamu projektů by se objevila nová verze.' }]);
      setBusy(false);
      setUnread(current => current + 1);
      onBuildReady();
    }, 2200);
  };

  return <>
    <Pressable onPress={() => { setOpen(true); setUnread(0); }} style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}>
      <Text style={styles.fabSpark}>✦</Text><Text style={styles.fabLabel}>AI CHAT</Text>
      {unread > 0 && <View style={styles.unread}><Text style={styles.unreadText}>{unread}</Text></View>}
    </Pressable>
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.dismiss} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View><Text style={styles.title}>Build assistant</Text><Text style={styles.subtitle}>CLOUD AGENTS · LOKÁLNÍ DEMO</Text></View>
            <Pressable onPress={() => setOpen(false)} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
          </View>
          <ScrollView style={styles.history} contentContainerStyle={styles.historyContent} showsVerticalScrollIndicator={false}>
            {messages.map((message, index) => <View key={`${index}-${message.role}`} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.agentBubble]}><Text style={[styles.message, message.role === 'user' && styles.userMessage]}>{message.text}</Text></View>)}
            {busy && <Text style={styles.busyText}>◌  Demo build se připravuje…</Text>}
          </ScrollView>
          <View style={styles.notice}><Text style={styles.noticeText}>Požadavek ani build se zatím neodesílají do cloudu — jde o lokální simulaci budoucího toku.</Text></View>
          <View style={styles.composer}>
            <TextInput value={draft} onChangeText={setDraft} placeholder="Popiš změnu nebo novou verzi…" placeholderTextColor="#93949A" multiline style={styles.input} />
            <Pressable onPress={send} disabled={busy || !draft.trim()} style={[styles.send, (busy || !draft.trim()) && styles.sendDisabled]}><Text style={styles.sendText}>↑</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', right: 20, bottom: 77, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#24252D', borderRadius: 24, paddingHorizontal: 15, paddingVertical: 11, shadowColor: '#191923', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  fabSpark: { color: '#E8D69B', fontSize: 13 }, fabLabel: { color: '#FFF', fontSize: 9, letterSpacing: 1, fontWeight: '800' }, unread: { position: 'absolute', right: -3, top: -5, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: '#D56D57', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }, unreadText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(23,24,30,0.35)' }, dismiss: { ...StyleSheet.absoluteFill }, sheet: { height: '78%', backgroundColor: '#F8F8F4', borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 20, paddingTop: 11, paddingBottom: 19 }, handle: { alignSelf: 'center', width: 35, height: 4, borderRadius: 2, backgroundColor: '#D8D9D5', marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottomWidth: 1, borderColor: '#E8E8E3' }, title: { color: '#23242B', fontSize: 21, fontWeight: '700', letterSpacing: -0.4 }, subtitle: { color: '#898A91', fontSize: 8, letterSpacing: 1.3, fontWeight: '700', marginTop: 5 }, close: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEEFEA', alignItems: 'center', justifyContent: 'center' }, closeText: { color: '#555761', fontSize: 22, lineHeight: 25 },
  history: { flex: 1 }, historyContent: { paddingTop: 16, paddingBottom: 10, gap: 10 }, bubble: { maxWidth: '88%', borderRadius: 15, paddingHorizontal: 13, paddingVertical: 11 }, agentBubble: { alignSelf: 'flex-start', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EBECE8', borderBottomLeftRadius: 5 }, userBubble: { alignSelf: 'flex-end', backgroundColor: '#EDEBFA', borderBottomRightRadius: 5 }, message: { color: '#555963', fontSize: 12, lineHeight: 18 }, userMessage: { color: '#4E47A0' }, busyText: { color: '#777A83', fontSize: 11, paddingVertical: 4 }, notice: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#F0EFF8', borderRadius: 9, marginBottom: 9 }, noticeText: { color: '#777584', fontSize: 9, lineHeight: 13 },
  composer: { minHeight: 53, maxHeight: 110, borderWidth: 1, borderColor: '#E1E1DC', borderRadius: 13, backgroundColor: '#FFF', paddingLeft: 12, paddingRight: 7, paddingVertical: 6, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }, input: { flex: 1, minHeight: 38, maxHeight: 86, color: '#292A32', fontSize: 12, paddingTop: 8, paddingBottom: 5, textAlignVertical: 'top' }, send: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#6658E8', alignItems: 'center', justifyContent: 'center', marginBottom: 1 }, sendDisabled: { opacity: 0.4 }, sendText: { color: '#FFF', fontSize: 19, fontWeight: '700' },
});
