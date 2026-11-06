import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type Tab = 'Vault' | 'Portfolio' | 'Remote' | 'Knowledge' | 'Security' | 'Checklists';
const tabs: Tab[] = ['Vault', 'Portfolio', 'Remote', 'Knowledge', 'Security', 'Checklists'];
const goals = [
  ['Rename to t-bridge', 'T–12d 04h', '▮▮▮▮', 82],
  ['Trademark check', 'T–21d 09h', '▮▮▮▯', 61],
  ['Done Deal · view count', 'T–34d 16h', '▮▮▮▯', 48],
  ['IČO registered', 'T–58d 02h', '▮▮▯▯', 38],
  ['E-shops go live', 'T–3mo 4d', '▮▮▯▯', 31],
  ['Ads launch', 'T–4mo 12d', '▮▮▯▯', 17],
  ['Corp agency kickoff', 'T–6mo', '▮▯▯▯', 14],
  ['Bridge public beta', 'T–9mo', '▮▮▯▯', 26],
  ['Telco pilot', 'T–1y 2mo', '▮▯▯▯', 8],
  ['Own network', 'T–2y', '▮▯▯▯', 5],
  ['Buy back t-bridge', 'T–5y', '▮▯▯▯', 2],
];

export default function App() {
  const [tab, setTab] = useState<Tab>('Vault');
  return <SafeAreaView style={styles.safe}>
    <StatusBar style="light" />
    <View style={styles.app}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topline}><View><Text style={styles.title}>{tab}</Text><Text style={styles.subtitle}>t-bridge storage · AI-managed</Text></View><Pressable style={styles.add}><Text style={styles.addText}>+</Text></Pressable></View>
        {tab === 'Vault' ? <Vault /> : <Placeholder tab={tab} />}
      </ScrollView>
      <View style={styles.nav}>{tabs.map(item => <Pressable key={item} onPress={() => setTab(item)} style={styles.navItem}><Text style={[styles.navIcon, tab === item && styles.active]}>{item === 'Vault' ? '▦' : item === 'Portfolio' ? '▤' : item === 'Remote' ? '◷' : item === 'Knowledge' ? '◇' : item === 'Security' ? '♢' : '☷'}</Text><Text style={[styles.navText, tab === item && styles.active]}>{item}</Text></Pressable>)}</View>
    </View>
  </SafeAreaView>;
}

function Vault() {
  return <>
    <View style={styles.summaryRow}><View style={styles.summaryCard}><Text style={styles.spark}>✧</Text><View><Text style={styles.cardHeading}>AI autopilot</Text><Text style={styles.cardSub}>2 min ago</Text></View><Text style={styles.check}>✓</Text></View><View style={styles.summaryCard}><View style={styles.ring}><Text style={styles.ringText}>64%</Text></View><View><Text style={styles.cardHeading}>Knowledge</Text><Text style={styles.cardSub}>3 sources</Text></View></View></View>
    <View style={styles.stats}><Stat label="Countdown" value="82" /><Stat label="AI" value="61" /><Stat label="Database" value="48" /></View>
    <View style={styles.tabs}><Pill label="Goals" active /><Pill label="Launches" /><Pill label="Network" /><Pressable style={styles.plusPill}><Text style={styles.plusPillText}>+</Text></Pressable></View>
    <View style={styles.goals}>{goals.map(([name, date, bars, progress], index) => <View key={String(name)} style={styles.goal}><View style={styles.goalTop}><Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text><Text style={styles.goalName}>{name}</Text><Text style={styles.bars}>{bars}</Text><Text style={styles.date}>{date}</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${progress}%` }]} /></View></View>)}</View>
  </>;
}
function Stat({ label, value }: { label: string; value: string }) { return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>; }
function Pill({ label, active }: { label: string; active?: boolean }) { return <Pressable style={[styles.pill, active && styles.pillActive]}><Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text></Pressable>; }
function Placeholder({ tab }: { tab: Tab }) { return <View style={styles.placeholder}><Text style={styles.placeholderTitle}>{tab}</Text><Text style={styles.placeholderText}>This space is ready for the next Vault module.</Text></View>; }

const colors = { bg: '#170d09', panel: '#2a1a11', panel2: '#332116', line: '#523a25', cream: '#f4e6d1', muted: '#c5ad91', gold: '#d9a25f', bright: '#ffdda6' };
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.bg }, app: { flex: 1, backgroundColor: colors.bg }, content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 94 }, topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }, title: { color: colors.cream, fontSize: 30, fontWeight: '700', letterSpacing: -1 }, subtitle: { color: colors.muted, fontSize: 13, marginTop: 2 }, add: { width: 43, height: 43, borderRadius: 22, backgroundColor: colors.bright, alignItems: 'center', justifyContent: 'center' }, addText: { color: colors.bg, fontSize: 27, fontWeight: '300', marginTop: -3 }, summaryRow: { flexDirection: 'row', gap: 10 }, summaryCard: { flex: 1, minHeight: 64, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }, spark: { color: colors.bright, fontSize: 21 }, cardHeading: { color: colors.cream, fontSize: 14, fontWeight: '700' }, cardSub: { color: colors.muted, fontSize: 11, marginTop: 3 }, check: { marginLeft: 'auto', color: colors.bg, backgroundColor: colors.gold, fontSize: 24, width: 23, height: 23, textAlign: 'center', lineHeight: 22, fontWeight: '800' }, ring: { width: 43, height: 43, borderRadius: 22, borderWidth: 4, borderColor: colors.gold, borderRightColor: colors.line, alignItems: 'center', justifyContent: 'center' }, ringText: { color: colors.cream, fontSize: 11, fontWeight: '700' }, stats: { flexDirection: 'row', marginTop: 12, marginBottom: 10, gap: 9 }, stat: { flex: 1, borderBottomWidth: 3, borderBottomColor: colors.gold, paddingBottom: 7 }, statLabel: { color: colors.muted, fontSize: 11 }, statValue: { color: colors.cream, fontSize: 13, fontWeight: '700', position: 'absolute', right: 0, bottom: 7 }, tabs: { flexDirection: 'row', gap: 7, marginBottom: 11 }, pill: { height: 45, paddingHorizontal: 19, borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center' }, pillActive: { backgroundColor: colors.bright, borderColor: colors.bright }, pillText: { color: colors.cream, fontSize: 13, fontWeight: '600' }, pillTextActive: { color: colors.bg }, plusPill: { width: 45, height: 45, borderRadius: 24, borderWidth: 1, borderColor: colors.muted, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }, plusPillText: { color: colors.cream, fontSize: 26, fontWeight: '300' }, goals: { gap: 9 }, goal: { minHeight: 37 }, goalTop: { flexDirection: 'row', alignItems: 'center', gap: 8 }, index: { width: 24, color: colors.muted, fontSize: 11, fontWeight: '600' }, goalName: { flex: 1, color: colors.cream, fontSize: 14, fontWeight: '700' }, bars: { color: colors.gold, fontSize: 15, letterSpacing: -2 }, date: { width: 64, color: colors.cream, fontSize: 11, textAlign: 'right', fontWeight: '600' }, track: { height: 8, backgroundColor: colors.panel2, borderRadius: 5, marginLeft: 32, marginTop: 5, overflow: 'hidden' }, fill: { height: '100%', backgroundColor: colors.bright, borderRadius: 5 }, nav: { height: 84, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: '#1b100b', flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10 }, navItem: { alignItems: 'center', flex: 1 }, navIcon: { color: colors.muted, fontSize: 20, height: 27 }, navText: { color: colors.muted, fontSize: 10 }, active: { color: colors.cream }, placeholder: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: 18, padding: 24, marginTop: 20 }, placeholderTitle: { color: colors.cream, fontSize: 24, fontWeight: '700' }, placeholderText: { color: colors.muted, marginTop: 8, lineHeight: 20 } });
