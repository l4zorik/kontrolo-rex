import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView, ScrollView, StyleSheet, Text, ImageBackground,
  TextInput, Pressable, View, Platform,
} from 'react-native';
import FloatingAIChat from './components/FloatingAIChat';

type AppStatus = 'LIVE' | 'BUILDING' | 'IDEA' | 'SUNSET' | 'BETA';
type ProductApp = {
  id: string; name: string; slug: string; tagline: string; status: AppStatus;
  stack: string[]; stars: number; issues: number; mrr: number; users: number;
  public: boolean; featured: boolean; icon: string; color: string; liveUrl?: string;
  description: string; deploy: string; health: boolean;
};

type Tab = 'Vault' | 'Portfolio' | 'Remote' | 'Business' | 'Planpoints';
type Planpoint = { id: string; title: string; detail: string; phase: string; done: boolean; project?: string };
const initialPlanpoints: Planpoint[] = [
  { id: 'p1', title: 'Vybrat první cílovou skupinu', detail: 'Ověřit potřeby indie tvůrců a malých produktových týmů.', phase: 'ZÁKLAD', done: true },
  { id: 'p2', title: 'Dokončit lokální UX prototyp', detail: 'Otestovat Vault, Portfolio a Remote na telefonu.', phase: 'ZÁKLAD', done: false },
  { id: 'p3', title: 'Navrhnout přihlášení a pracovní prostory', detail: 'Oddělit uživatelské účty, organizace a oprávnění.', phase: 'CLOUD', done: false },
  { id: 'p4', title: 'Připojit GitHub import', detail: 'Povolit bezpečné propojení a výběr repozitáře.', phase: 'CLOUD', done: false },
  { id: 'p5', title: 'Spustit izolované cloudové buildy', detail: 'Zobrazit stav, logy a náhled nové verze.', phase: 'BUILDY', done: false },
  { id: 'p6', title: 'Připravit ověřený marketplace pilot', detail: 'Definovat původ, licence a pravidla publikování.', phase: 'MARKETPLACE', done: false },
];
const initialApps: ProductApp[] = [
  { id: '1', name: 'Flowboard', slug: 'flowboard', tagline: 'Klidnější plánování pro malé týmy.', status: 'LIVE', stack: ['Next.js', 'Supabase', 'OpenAI'], stars: 128, issues: 3, mrr: 420, users: 842, public: true, featured: true, icon: 'F', color: '#6658E8', liveUrl: 'flowboard.app', description: 'Lehký týmový prostor, který pomáhá převést nápady do přehledných plánů. Navržený pro soustředěnou práci bez zbytečného šumu.', deploy: 'Před 2 h', health: true },
  { id: '2', name: 'Promptbase', slug: 'promptbase', tagline: 'Prompty, které se neztratí.', status: 'BUILDING', stack: ['Expo', 'Node.js', 'SQLite'], stars: 42, issues: 8, mrr: 0, users: 56, public: true, featured: false, icon: 'P', color: '#13A88A', liveUrl: 'promptbase.dev', description: 'Osobní knihovna promptů s verzováním, štítky a rychlým sdílením s týmem.', deploy: 'Včera', health: true },
  { id: '3', name: 'Northstar', slug: 'northstar', tagline: 'Malý kompas pro velké cíle.', status: 'IDEA', stack: ['React Native', 'AI'], stars: 0, issues: 0, mrr: 0, users: 0, public: false, featured: false, icon: 'N', color: '#E59C45', description: 'Koncept osobního dashboardu pro cíle, návyky a týdenní reflexi.', deploy: 'Zatím bez deploye', health: false },
];
const statusMeta: Record<AppStatus, { label: string; bg: string; fg: string }> = {
  LIVE: { label: 'LIVE', bg: '#E6F5EE', fg: '#18865B' },
  BUILDING: { label: 'BUILDING', bg: '#E9EDFF', fg: '#4C5ED3' },
  IDEA: { label: 'IDEA', bg: '#EEF0F1', fg: '#707780' },
  BETA: { label: 'BETA', bg: '#FFF1D9', fg: '#A96A0A' },
  SUNSET: { label: 'SUNSET', bg: '#FCE8E7', fg: '#BC4B45' },
};
const ink = '#20232B';
const muted = '#838891';
const line = '#E9EAE7';

function Label({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}
function Action({ title, onPress, secondary = false, compact = false }: { title: string; onPress: () => void; secondary?: boolean; compact?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.76 }]}><ImageBackground source={require('./assets/marble-button.png')} resizeMode="cover" imageStyle={styles.actionImage} style={[styles.action, secondary && styles.actionSecondary, compact && styles.actionCompact]}><View style={[styles.marbleWash, compact && styles.marbleWashCompact, secondary && styles.marbleWashSecondary]}><Text style={[styles.actionText, secondary && styles.actionTextSecondary, compact && styles.actionTextCompact]}>{title}</Text></View></ImageBackground></Pressable>;
}
function StatusPill({ status }: { status: AppStatus }) {
  const meta = statusMeta[status];
  return <View style={[styles.statusPill, { backgroundColor: meta.bg }]}><View style={[styles.statusDot, { backgroundColor: meta.fg }]} /><Text style={[styles.statusText, { color: meta.fg }]}>{meta.label}</Text></View>;
}

export default function App() {
  const [apps, setApps] = useState(initialApps);
  const [planpoints, setPlanpoints] = useState(initialPlanpoints);
  const [tab, setTab] = useState<Tab>('Vault');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ProductApp | null>(null);
  const [sort, setSort] = useState<'Deploy' | 'MRR' | 'Stars'>('Deploy');
  const [toast, setToast] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newStack, setNewStack] = useState('Expo, React Native');

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2400);
  };
  const togglePublic = (id: string) => {
    setApps(current => current.map(a => a.id === id ? { ...a, public: !a.public } : a));
    if (selected?.id === id) setSelected(a => a ? { ...a, public: !a.public } : a);
    notify('Viditelnost portfolia byla aktualizována.');
  };
  const visibleApps = useMemo(() => {
    let result = [...apps];
    if (tab === 'Portfolio') result = result.filter(a => a.public).sort((a, b) => Number(b.featured) - Number(a.featured));
    else if (filter !== 'All') result = result.filter(a => a.status === filter.toUpperCase());
    if (search.trim()) result = result.filter(a => `${a.name} ${a.tagline} ${a.stack.join(' ')}`.toLowerCase().includes(search.toLowerCase()));
    if (tab !== 'Portfolio') result.sort((a, b) => sort === 'MRR' ? b.mrr - a.mrr : sort === 'Stars' ? b.stars - a.stars : apps.indexOf(a) - apps.indexOf(b));
    return result;
  }, [apps, tab, filter, search, sort]);
  const addApp = () => {
    if (!newName.trim()) { notify('Doplň název aplikace.'); return; }
    const slug = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const item: ProductApp = { id: String(Date.now()), name: newName.trim(), slug, tagline: newTagline.trim() || 'Nová aplikace ve skladu.', status: 'IDEA', stack: newStack.split(',').map(x => x.trim()).filter(Boolean), stars: 0, issues: 0, mrr: 0, users: 0, public: false, featured: false, icon: newName.trim()[0].toUpperCase(), color: '#6658E8', description: 'Popis projektu můžeš doplnit později.', deploy: 'Zatím bez deploye', health: false };
    setApps(current => [item, ...current]); setShowNew(false); setNewName(''); setNewTagline(''); setTab('Vault'); setFilter('All'); notify('Aplikace přidána do skladu.');
  };

  const renderCard = (item: ProductApp) => (
    <View key={item.id} style={styles.card}>
      <Pressable onPress={() => setSelected(item)}>
        <View style={[styles.appTile, { backgroundColor: item.color }]}><Text style={styles.appTileLetter}>{item.icon}</Text><View style={styles.tileSpark}><Text style={{ color: '#fff', fontSize: 14 }}>✦</Text></View></View>
        <View style={styles.cardTitleRow}><Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text><View style={[styles.health, { backgroundColor: item.status === 'LIVE' ? (item.health ? '#26A875' : '#D66B5D') : '#D9DCE0' }]} /></View>
        <Text numberOfLines={2} style={styles.cardTagline}>{item.tagline}</Text>
        <View style={styles.cardBadgeRow}><StatusPill status={item.status} /></View>
        <View style={styles.stackRow}>{item.stack.slice(0, 2).map(s => <Text key={s} style={styles.stackChip}>{s}</Text>)}{item.stack.length > 2 && <Text style={styles.stackMore}>+{item.stack.length - 2}</Text>}</View>
        <View style={styles.metricsRow}><Text style={styles.metric}>★ {item.stars}</Text><Text style={styles.metric}>◌ {item.issues}</Text><Text style={styles.metric}>${item.mrr}</Text></View>
      </Pressable>
      <View style={styles.cardButtons}><Action title="Remote ↗" compact onPress={() => { setSelected(item); setTab('Remote'); }} /><Pressable onPress={() => setSelected(item)} style={styles.detailBtn}><Text style={styles.detailText}>Detail</Text></Pressable></View>
    </View>
  );

  const Header = ({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) => (
    <View style={styles.header}>
      <View style={styles.headerTop}><View style={styles.brand}><View style={styles.brandMark}><View style={styles.brandMarkInner} /></View><Text style={styles.brandName}>VAULT / STUDIO</Text></View><Pressable onPress={() => notify('Lokální demo režim')} style={styles.avatar}><Text style={styles.avatarText}>M</Text></Pressable></View>
      <Text style={styles.kicker}>{kicker}</Text><Text style={styles.pageTitle}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.root}>
        {selected && tab !== 'Remote' && !showNew ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerTop}><Pressable onPress={() => setSelected(null)} style={styles.backButton}><Text style={styles.backText}>‹  Sklad</Text></Pressable><Pressable onPress={() => togglePublic(selected.id)}><Text style={styles.headerLink}>{selected.public ? '● Veřejná' : '○ Soukromá'}</Text></Pressable></View>
            <View style={[styles.detailHero, { backgroundColor: selected.color }]}><Text style={styles.heroLetter}>{selected.icon}</Text><Text style={styles.heroMeta}>APP VAULT  /  0{selected.id}</Text></View>
            <View style={styles.detailHeading}><View style={styles.detailNameRow}><Text style={styles.detailTitle}>{selected.name}</Text><StatusPill status={selected.status} /></View><Text style={styles.subtitle}>{selected.tagline}</Text></View>
            <View style={styles.detailActions}><Action title="Otevřít Remote ↗" onPress={() => setTab('Remote')} /><Action title="Sync metrik" secondary onPress={() => notify('Demo: metriky jsou aktuální.')} /></View>
            <View style={styles.statGrid}>{[[String(selected.users), 'UŽIVATELÉ'], [`$${selected.mrr}`, 'MRR'], [String(selected.stars), 'GITHUB STARS'], [String(selected.issues), 'OPEN ISSUES']].map(([v, l]) => <View key={l} style={styles.statBox}><Text style={styles.statValue}>{v}</Text><Text style={styles.statLabel}>{l}</Text></View>)}</View>
            <SectionTitle title="O projektu" trailing="EDIT" onTrailing={() => notify('Editace popisu bude dostupná v další verzi.')} /><Text style={styles.bodyText}>{selected.description}</Text>
            <SectionTitle title="Technologie" /><View style={styles.detailStack}>{selected.stack.map(s => <Text key={s} style={styles.stackChip}>{s}</Text>)}</View>
            <SectionTitle title="Provoz" trailing={selected.health ? '● HEALTHY' : '○ —'} /><View style={styles.infoRow}><Text style={styles.infoLabel}>Poslední deploy</Text><Text style={styles.infoValue}>{selected.deploy}</Text></View><View style={styles.infoRow}><Text style={styles.infoLabel}>Živá adresa</Text><Text style={styles.infoValue}>{selected.liveUrl || '—'}</Text></View>
            <View style={styles.tabsPreview}><Text style={styles.tabPreviewActive}>Runs  ·  4</Text><Text style={styles.tabPreviewInactive}>Automations  ·  2</Text></View><Text style={styles.bodyText}>Běhy a automatizace jsou v tomto MVP ukázkové.</Text>
          </ScrollView>
        ) : showNew ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerTop}><Pressable onPress={() => setShowNew(false)} style={styles.backButton}><Text style={styles.backText}>‹  Zrušit</Text></Pressable><Text style={styles.kicker}>NOVÝ IMPORT · DEMO</Text></View>
            <Text style={styles.pageTitle}>Přidat projekt</Text><Text style={styles.subtitle}>Vytvoří demo záznam. Skutečný cloud/GitHub import zatím není zapojen.</Text>
            <FormField label="NÁZEV" value={newName} onChangeText={setNewName} placeholder="Např. My Product" />
            <FormField label="TAGLINE" value={newTagline} onChangeText={setNewTagline} placeholder="Jedna věta o projektu" />
            <FormField label="STACK · ODDĚL ČÁRKOU" value={newStack} onChangeText={setNewStack} placeholder="Expo, React Native" />
            <View style={styles.formHint}><Text style={styles.formHintText}>STATUS  ·  IDEA</Text><Text style={styles.formHintText}>VISIBILITY  ·  PRIVATE</Text></View>
            <Action title="Přidat demo projekt  →" onPress={addApp} />
          </ScrollView>
        ) : tab === 'Business' ? (
          <BusinessManagement apps={apps} notify={notify} />
        ) : tab === 'Remote' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Header kicker="PRACOVNÍ PROSTOR" title="Remote" subtitle="Ovládací centrum pro tvé projekty." />
            <View style={styles.remoteContext}><Text style={styles.contextLabel}>AKTIVNÍ KONTEXT</Text><View style={styles.contextRow}><View style={[styles.contextIcon, { backgroundColor: selected?.color || '#6658E8' }]}><Text style={styles.contextIconText}>{selected?.icon || '◎'}</Text></View><View style={{ flex: 1 }}><Text style={styles.contextName}>{selected?.name || 'Globální prostor'}</Text><Text style={styles.contextSub}>{selected ? `Scoped · ${selected.slug}` : 'Všechna tvoje apps'}</Text></View>{selected && <Pressable onPress={() => setSelected(null)}><Text style={styles.clearContext}>×</Text></Pressable>}</View></View>
            <View style={styles.remoteComposer}><Text style={styles.composerLabel}>ZEPTEJ SE SVÉHO AGENTA</Text><TextInput placeholder="Co dnes potřebuješ vyřešit?" placeholderTextColor="#9DA1A8" style={styles.composerInput} multiline /><View style={styles.composerBottom}><Text style={styles.modelChip}>✦  Claude Sonnet</Text><Pressable onPress={() => notify('Demo režim: agent zatím není připojen.')} style={styles.sendButton}><Text style={styles.sendText}>↑</Text></Pressable></View></View>
            <SectionTitle title="Rychlý přístup" /><View style={styles.quickGrid}>{[['◈', 'Models', '3 providers'], ['✦', 'Agents', '2 aktivní'], ['↻', 'Automate', '4 flows'], ['⌘', 'GitHub', '3 repos']].map(([icon, title, sub]) => <Pressable key={title} onPress={() => notify(`${title}: připojení bude v další verzi.`)} style={styles.quickCard}><Text style={styles.quickIcon}>{icon}</Text><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickSub}>{sub}</Text></Pressable>)}</View>
            <View style={styles.notice}><Text style={styles.noticeTitle}>Cloud imports · demo data</Text><Text style={styles.noticeBody}>Ukázka importovaných projektů. Skutečná cloud databáze ani agenti zatím nejsou připojeni.</Text></View>
            <SectionTitle title="Později" /><View style={styles.notice}><Text style={styles.noticeBody}>Právní podpora  ·  monetizace a reklamy  ·  vlastní marketplace</Text></View>
          </ScrollView>
        ) : tab === 'Portfolio' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Header kicker="PORTFOLIO PREVIEW  /  DEMO" title="Portfolio" subtitle="Ukázkový read-only výstup z demo dat." />
            <View style={styles.portfolioBanner}><Text style={styles.portfolioEyebrow}>VAULT / PORTFOLIO</Text><Text style={styles.portfolioHeadline}>Práce, která{ '\n' }mluví sama za sebe.</Text><Text style={styles.portfolioCount}>{apps.filter(a => a.public).length} VEŘEJNÉ PROJEKTY</Text></View>
            <View style={styles.portfolioList}>{visibleApps.length ? visibleApps.map(item => <Pressable key={item.id} onPress={() => setSelected(item)} style={styles.portfolioCard}><View style={[styles.portfolioIcon, { backgroundColor: item.color }]}><Text style={styles.portfolioIconText}>{item.icon}</Text></View><View style={{ flex: 1 }}><View style={styles.portfolioTitleRow}><Text style={styles.portfolioTitle}>{item.name}</Text>{item.featured && <Text style={styles.featured}>FEATURED</Text>}</View><Text style={styles.cardTagline}>{item.tagline}</Text><View style={styles.stackRow}>{item.stack.slice(0, 3).map(s => <Text key={s} style={styles.stackChip}>{s}</Text>)}</View></View><Text style={styles.arrow}>↗</Text></Pressable>) : <EmptyState onAdd={() => { setTab('Vault'); setShowNew(true); }} />}</View>
            <Text style={styles.portfolioFoot}>PORTFOLIO PREVIEW  ·  READ ONLY</Text>
          </ScrollView>
        ) : tab === 'Planpoints' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Header kicker="PLÁN ROZVOJE  /  DEMO" title="Planpoints" subtitle="Checklist dalších kroků od lokálního prototypu ke cloudové platformě." />
            <View style={styles.planSummary}>
              <View style={styles.planProgressTop}><Text style={styles.planSummaryLabel}>CELKOVÝ POSTUP</Text><Text style={styles.planProgressValue}>{planpoints.filter(point => point.done).length} / {planpoints.length}</Text></View>
              <View style={styles.planProgressTrack}><View style={[styles.planProgressFill, { width: `${Math.round((planpoints.filter(point => point.done).length / planpoints.length) * 100)}%` }]} /></View>
              <Text style={styles.planSummaryHint}>Body jsou ukázkový plán, ne cloudově synchronizované úkoly.</Text>
            </View>
            {Array.from(new Set(planpoints.map(point => point.phase))).map(phase => {
              const phasePoints = planpoints.filter(point => point.phase === phase);
              return <View key={phase} style={styles.planPhase}><View style={styles.planPhaseHeader}><Text style={styles.planPhaseTitle}>{phase}</Text><Text style={styles.planPhaseCount}>{phasePoints.filter(point => point.done).length}/{phasePoints.length} HOTOVO</Text></View>{phasePoints.map(point => <Pressable key={point.id} onPress={() => setPlanpoints(current => current.map(item => item.id === point.id ? { ...item, done: !item.done } : item))} style={styles.planPoint}><View style={[styles.planCheck, point.done && styles.planCheckDone]}><Text style={styles.planCheckMark}>{point.done ? '✓' : ''}</Text></View><View style={styles.planPointCopy}><Text style={[styles.planPointTitle, point.done && styles.planPointTitleDone]}>{point.title}</Text><Text style={styles.planPointDetail}>{point.detail}</Text></View><Text style={styles.planPointArrow}>›</Text></Pressable>)}</View>;
            })}
            <View style={styles.notice}><Text style={styles.noticeTitle}>Lokální demo checklist</Text><Text style={styles.noticeBody}>Odškrtnutí se zatím neukládá po restartu aplikace. Cloudové úkoly, přiřazování a upozornění doplníme až s backendem.</Text></View>
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Header kicker="CLOUD IMPORTS  /  DEMO DATA" title="Aplikace." subtitle="Ukázka projektů z cloudového skladu. Ovladač můžeš vyzkoušet lokálně v telefonu." />
            <View style={styles.overview}><View><Text style={styles.overviewLabel}>IMPORTED PROJECTS · DEMO</Text><Text style={styles.overviewValue}>{String(apps.length).padStart(2, '0')} <Text style={styles.overviewUnit}>APPS</Text></Text></View><View style={styles.overviewRight}><View style={styles.onlineDot} /><Text style={styles.overviewLive}>{apps.filter(a => a.status === 'LIVE').length} LIVE</Text><Text style={styles.overviewDivider}>/</Text><Text style={styles.overviewSub}>{apps.filter(a => a.status === 'BUILDING').length} BUILDING</Text></View></View>
            <View style={styles.toolbar}><View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder="Hledat appku..." placeholderTextColor="#9599A1" style={styles.searchInput} /></View><Pressable onPress={() => { setShowNew(true); setSelected(null); }} style={styles.addBtn}><Text style={styles.addBtnText}>＋</Text></Pressable></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>{['All', 'Live', 'Building', 'Idea', 'Sunset'].map(f => <Pressable onPress={() => setFilter(f)} key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]}><Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>{f === 'All' && <Text style={[styles.filterCount, filter === f && styles.filterTextActive]}>{apps.length}</Text>}</Pressable>)}</ScrollView>
            <View style={styles.sortRow}><Text style={styles.resultsText}>{visibleApps.length} PROJEKTY</Text><View style={styles.sortControls}>{(['Deploy', 'MRR', 'Stars'] as const).map(s => <Pressable key={s} onPress={() => setSort(s)}><Text style={[styles.sortText, sort === s && styles.sortActive]}>{s}{sort === s ? '⌄' : ''}</Text></Pressable>)}</View></View>
            {visibleApps.length ? <View style={styles.grid}>{visibleApps.map(renderCard)}</View> : <EmptyState onAdd={() => setShowNew(true)} />}
            <View style={styles.syncRow}><Text style={styles.syncInfo}>POSLEDNÍ SYNC  ·  PŘED CHVÍLÍ</Text><Pressable onPress={() => notify('Demo: metriky byly synchronizovány.')}><Text style={styles.syncButton}>↻  SYNC ALL</Text></Pressable></View>
          </ScrollView>
        )}
        {!showNew && <FloatingAIChat onBuildReady={() => notify('Demo build dokončen · v reálné verzi přijde oznámení z cloudu.')} />}
        <View style={styles.bottomNav}>{(['Vault', 'Planpoints', 'Portfolio', 'Business', 'Remote'] as Tab[]).map((t, i) => <Pressable key={t} onPress={() => { setTab(t); setShowNew(false); if (t !== 'Remote') setSelected(null); }} style={styles.navItem}><Text style={[styles.navIcon, tab === t && styles.navActive]}>{['▦', '☷', '◫', '◆', '⌘'][i]}</Text><Text style={[styles.navText, tab === t && styles.navActive]}>{t}</Text>{tab === t && <View style={styles.navMarker} />}</Pressable>)}</View>
        {toast ? <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}
      </View>
    </SafeAreaView>
  );
}
type TeamMember = { name: string; role: string; initials: string; color: string };
const teamMembers: TeamMember[] = [
  { name: 'Marek Novák', role: 'Founder · CEO', initials: 'MN', color: '#6658E8' },
  { name: 'Eva Dvořáková', role: 'Product Designer', initials: 'ED', color: '#13A88A' },
  { name: 'Tomáš Horák', role: 'Full‑stack Dev', initials: 'TH', color: '#E59C45' },
  { name: 'Lucie Černá', role: 'Marketing', initials: 'LČ', color: '#D66B5D' },
];
type Milestone = { label: string; date: string; done: boolean };
const milestones: Milestone[] = [
  { label: 'Flowboard v1.0 launch', date: 'Q1 2026', done: true },
  { label: 'Promptbase beta release', date: 'Q2 2026', done: false },
  { label: 'Northstar prototype', date: 'Q3 2026', done: false },
  { label: 'Marketplace MVP', date: 'Q4 2026', done: false },
];
type Expense = { category: string; amount: number; color: string };
const expenses: Expense[] = [
  { category: 'Hosting', amount: 340, color: '#6658E8' },
  { category: 'AI API', amount: 180, color: '#13A88A' },
  { category: 'Marketing', amount: 90, color: '#E59C45' },
  { category: 'Nástroje', amount: 45, color: '#D66B5D' },
];

function BusinessManagement({ apps, notify }: { apps: ProductApp[]; notify: (m: string) => void }) {
  const totalMRR = apps.reduce((sum, a) => sum + a.mrr, 0);
  const totalUsers = apps.reduce((sum, a) => sum + a.users, 0);
  const totalStars = apps.reduce((sum, a) => sum + a.stars, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalMRR - totalExpenses;
  const maxExpense = Math.max(...expenses.map(e => e.amount), 1);
  const liveApps = apps.filter(a => a.status === 'LIVE').length;
  const completedMilestones = milestones.filter(m => m.done).length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerTop}><View style={styles.brand}><View style={styles.brandMark}><View style={styles.brandMarkInner} /></View><Text style={styles.brandName}>VAULT / STUDIO</Text></View><Pressable onPress={() => notify('Lokální demo režim')} style={styles.avatar}><Text style={styles.avatarText}>M</Text></Pressable></View>
        <Text style={styles.kicker}>BYZNYS  /  DEMO DATA</Text><Text style={styles.pageTitle}>Business.</Text><Text style={styles.subtitle}>Přehled příjmů, výdajů, týmu a milníků napříč projekty.</Text>
      </View>

      <View style={styles.bizRevenueCard}>
        <View style={styles.bizRevenueTop}><View><Text style={styles.bizRevenueLabel}>CELKOVÉ MRR</Text><Text style={styles.bizRevenueValue}>${totalMRR}</Text></View><View style={styles.bizProfitBadge}><Text style={styles.bizProfitDot}>●</Text><Text style={styles.bizProfitText}>${profit >= 0 ? '+' : ''}{profit} zisk</Text></View></View>
        <View style={styles.bizRevenueStats}><View style={styles.bizRevenueStat}><Text style={styles.bizRevenueStatValue}>{totalUsers.toLocaleString()}</Text><Text style={styles.bizRevenueStatLabel}>UŽIVATELÉ</Text></View><View style={styles.bizRevenueStat}><Text style={styles.bizRevenueStatValue}>{totalStars}</Text><Text style={styles.bizRevenueStatLabel}>STARS</Text></View><View style={styles.bizRevenueStat}><Text style={styles.bizRevenueStatValue}>{liveApps}</Text><Text style={styles.bizRevenueStatLabel}>LIVE</Text></View></View>
      </View>

      <SectionTitle title="Příjmy podle projektů" />
      <View style={styles.bizSection}>
        {apps.filter(a => a.mrr > 0).length ? apps.filter(a => a.mrr > 0).map(item => {
          const pct = totalMRR > 0 ? Math.round((item.mrr / totalMRR) * 100) : 0;
          return (
            <View key={item.id} style={styles.bizRevenueRow}>
              <View style={[styles.bizRevenueDot, { backgroundColor: item.color }]} />
              <Text style={styles.bizRevenueName}>{item.name}</Text>
              <View style={styles.bizRevenueBar}><View style={[styles.bizRevenueBarFill, { width: `${pct}%`, backgroundColor: item.color }]} /></View>
              <Text style={styles.bizRevenueAmount}>${item.mrr}</Text>
              <Text style={styles.bizRevenuePct}>{pct}%</Text>
            </View>
          );
        }) : <Text style={styles.bodyText}>Zatím žádné příjmy. Spusť projekt do LIVE.</Text>}
      </View>

      <SectionTitle title="Výdaje" trailing={`${totalExpenses}/měs`} />
      <View style={styles.bizSection}>
        {expenses.map(e => (
          <View key={e.category} style={styles.bizExpenseRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.bizExpenseTop}><Text style={styles.bizExpenseName}>{e.category}</Text><Text style={styles.bizExpenseAmount}>${e.amount}</Text></View>
              <View style={styles.bizExpenseBar}><View style={[styles.bizExpenseBarFill, { width: `${Math.round((e.amount / maxExpense) * 100)}%`, backgroundColor: e.color }]} /></View>
            </View>
          </View>
        ))}
        <View style={styles.bizExpenseSummary}><Text style={styles.bizExpenseNetLabel}>ČISTÝ ZISK</Text><Text style={[styles.bizExpenseNetValue, { color: profit >= 0 ? '#18865B' : '#BC4B45' }]}>${profit}/měs</Text></View>
      </View>

      <SectionTitle title="Tým" trailing={`${teamMembers.length} ČLENŮ`} />
      <View style={styles.bizSection}>
        {teamMembers.map(m => (
          <View key={m.name} style={styles.bizTeamRow}>
            <View style={[styles.bizTeamAvatar, { backgroundColor: m.color }]}><Text style={styles.bizTeamInitials}>{m.initials}</Text></View>
            <View style={{ flex: 1 }}><Text style={styles.bizTeamName}>{m.name}</Text><Text style={styles.bizTeamRole}>{m.role}</Text></View>
            <Pressable onPress={() => notify('Profil člena týmu bude dostupný v další verzi.')}><Text style={styles.arrow}>↗</Text></Pressable>
          </View>
        ))}
        <Pressable onPress={() => notify('Pozvání člena týmu bude dostupné v další verzi.')} style={styles.bizTeamInvite}><Text style={styles.bizTeamInviteText}>＋  Pozvat člena</Text></Pressable>
      </View>

      <SectionTitle title="Milníky" trailing={`${completedMilestones}/${milestones.length}`} />
      <View style={styles.bizSection}>
        {milestones.map((m, i) => (
          <View key={i} style={styles.bizMilestoneRow}>
            <View style={[styles.bizMilestoneDot, m.done && styles.bizMilestoneDotDone]}><Text style={styles.bizMilestoneDotText}>{m.done ? '✓' : ''}</Text></View>
            <View style={{ flex: 1 }}><Text style={[styles.bizMilestoneLabel, m.done && styles.bizMilestoneLabelDone]}>{m.label}</Text><Text style={styles.bizMilestoneDate}>{m.date}</Text></View>
          </View>
        ))}
      </View>

      <View style={styles.notice}><Text style={styles.noticeTitle}>Business · demo data</Text><Text style={styles.noticeBody}>Příjmy, výdaje, tým a milníky jsou ukázkové. Skutečné napojení na platby, fakturaci a projektový management přijde v další verzi.</Text></View>
    </ScrollView>
  );
}

function SectionTitle({ title, trailing, onTrailing }: { title: string; trailing?: string; onTrailing?: () => void }) {
  return <View style={styles.sectionTitleRow}><Text style={styles.sectionTitle}>{title}</Text>{trailing && <Pressable onPress={onTrailing}><Text style={styles.sectionTrailing}>{trailing}</Text></Pressable>}</View>;
}
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return <View style={styles.empty}><Text style={styles.emptyMark}>▦</Text><Text style={styles.emptyTitle}>Zatím prázdný sklad</Text><Text style={styles.emptyBody}>Přidej první appku a dej projektům své místo.</Text><Action title="Přidat první appku" onPress={onAdd} /></View>;
}
function FormField({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (s: string) => void; placeholder: string }) {
  return <View style={styles.formField}><Text style={styles.formLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#A7ABB1" style={styles.formInput} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F3' },
  root: { flex: 1, backgroundColor: '#F7F7F3' },
  scrollContent: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 34 },
  header: { marginBottom: 22 },
  headerTop: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandMark: { width: 24, height: 24, borderWidth: 1.5, borderColor: '#6658E8', borderRadius: 7, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '45deg' }] }, brandMarkInner: { width: 7, height: 7, backgroundColor: '#6658E8', borderRadius: 2 }, brandName: { color: '#42454D', fontSize: 10, fontWeight: '800', letterSpacing: 1.7 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E9E6FA', justifyContent: 'center', alignItems: 'center' }, avatarText: { color: '#6658E8', fontSize: 12, fontWeight: '800' },
  kicker: { color: '#8D9098', fontSize: 10, fontWeight: '700', letterSpacing: 2.1, marginBottom: 8 }, pageTitle: { color: ink, fontSize: 35, lineHeight: 40, fontWeight: '700', letterSpacing: -1.2 }, subtitle: { color: muted, fontSize: 14, lineHeight: 21, marginTop: 6 },
  overview: { backgroundColor: '#22242D', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 17 }, overviewLabel: { color: '#B6B7C0', fontSize: 9, fontWeight: '700', letterSpacing: 1.4 }, overviewValue: { color: '#FFF', fontSize: 28, fontWeight: '700', marginTop: 4 }, overviewUnit: { fontSize: 10, color: '#B6B7C0', letterSpacing: 1.5 }, overviewRight: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }, onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5BD39D' }, overviewLive: { color: '#74DBA9', fontSize: 10, fontWeight: '700' }, overviewDivider: { color: '#777985', marginHorizontal: 2 }, overviewSub: { color: '#D6D7DD', fontSize: 10 },
  toolbar: { flexDirection: 'row', gap: 9, marginBottom: 14 }, searchBox: { flex: 1, height: 43, borderWidth: 1, borderColor: line, backgroundColor: '#FFF', borderRadius: 11, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }, searchIcon: { fontSize: 23, color: '#828690', marginRight: 7 }, searchInput: { flex: 1, color: ink, fontSize: 13, paddingVertical: 0 }, addBtn: { width: 43, height: 43, borderRadius: 11, backgroundColor: '#6658E8', justifyContent: 'center', alignItems: 'center' }, addBtnText: { color: '#FFF', fontSize: 25, lineHeight: 28, fontWeight: '300' },
  filterRow: { gap: 7, paddingBottom: 8 }, filterChip: { borderWidth: 1, borderColor: line, borderRadius: 20, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', gap: 6, alignItems: 'center' }, filterChipActive: { backgroundColor: ink, borderColor: ink }, filterText: { color: '#656A73', fontSize: 11, fontWeight: '600' }, filterTextActive: { color: '#FFF' }, filterCount: { color: '#A6A8AF', fontSize: 10 },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9, marginBottom: 10 }, resultsText: { color: '#9A9DA3', fontSize: 9, letterSpacing: 1.2, fontWeight: '700' }, sortControls: { flexDirection: 'row', gap: 12 }, sortText: { color: '#92959C', fontSize: 10 }, sortActive: { color: ink, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 11 }, card: { width: '48.4%', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ECEDEA', borderRadius: 14, padding: 10, marginBottom: 0 }, appTile: { width: '100%', height: 91, borderRadius: 10, padding: 12, justifyContent: 'flex-end', overflow: 'hidden' }, appTileLetter: { color: '#FFF', fontSize: 38, lineHeight: 42, fontWeight: '700', opacity: 0.96 }, tileSpark: { width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', position: 'absolute', right: 9, top: 9, justifyContent: 'center', alignItems: 'center' }, cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 11 }, cardTitle: { flex: 1, color: ink, fontSize: 14, fontWeight: '700', letterSpacing: -0.2 }, health: { height: 6, width: 6, borderRadius: 3, marginLeft: 5 }, cardTagline: { minHeight: 33, color: muted, fontSize: 10, lineHeight: 15, marginTop: 4 }, cardBadgeRow: { marginTop: 6, alignItems: 'flex-start' }, statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4 }, statusDot: { width: 5, height: 5, borderRadius: 3 }, statusText: { fontSize: 8, letterSpacing: 0.5, fontWeight: '800' }, stackRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 9 }, stackChip: { overflow: 'hidden', borderRadius: 5, backgroundColor: '#F3F3F1', color: '#696D76', fontSize: 8, paddingHorizontal: 6, paddingVertical: 4 }, stackMore: { color: '#8F929A', fontSize: 9 }, metricsRow: { borderTopWidth: 1, borderTopColor: '#F0F0ED', marginTop: 9, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' }, metric: { color: '#5C6068', fontSize: 9, fontWeight: '600' }, cardButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0ED' }, action: { minHeight: 43, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E2D9', borderRadius: 12, paddingHorizontal: 14, overflow: 'hidden' }, actionImage: { borderRadius: 11 }, actionSecondary: { borderColor: '#E4E1F6' }, actionCompact: { minHeight: 29, borderRadius: 8, paddingHorizontal: 9 }, marbleWash: { flex: 1, minHeight: 41, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.19)' }, marbleWashCompact: { minHeight: 27, paddingHorizontal: 9 }, marbleWashSecondary: { backgroundColor: 'rgba(235,232,251,0.30)' }, actionText: { color: '#383640', fontSize: 12, fontWeight: '700' }, actionTextSecondary: { color: '#5E55B5' }, actionTextCompact: { fontSize: 9 }, detailBtn: { paddingHorizontal: 5, paddingVertical: 7 }, detailText: { color: '#6F727B', fontSize: 9, fontWeight: '600' },
  syncRow: { borderTopWidth: 1, borderColor: line, marginTop: 22, paddingTop: 14, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }, syncInfo: { color: '#A0A2A7', fontSize: 8, letterSpacing: 0.8, alignSelf: 'center' }, syncButton: { color: '#6658E8', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  bottomNav: { height: 68, borderTopWidth: 1, borderTopColor: '#E9EAE7', flexDirection: 'row', backgroundColor: '#FCFCF9', justifyContent: 'space-around', paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 12 : 4 }, navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }, navIcon: { color: '#92959C', fontSize: 17, lineHeight: 21 }, navText: { color: '#92959C', fontSize: 9, fontWeight: '600', marginTop: 2 }, navActive: { color: '#6658E8' }, navMarker: { position: 'absolute', width: 18, height: 2, backgroundColor: '#6658E8', borderRadius: 2, top: -8 },
  planSummary: { backgroundColor: '#22242D', borderRadius: 16, padding: 17, marginBottom: 25 }, planProgressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, planSummaryLabel: { color: '#B6B7C0', fontSize: 9, fontWeight: '700', letterSpacing: 1.4 }, planProgressValue: { color: '#FFF', fontSize: 18, fontWeight: '700' }, planProgressTrack: { height: 5, borderRadius: 4, backgroundColor: '#454751', marginTop: 13, overflow: 'hidden' }, planProgressFill: { height: 5, borderRadius: 4, backgroundColor: '#8D80FF' }, planSummaryHint: { color: '#B6B7C0', fontSize: 10, marginTop: 10 }, planPhase: { marginBottom: 18 }, planPhaseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }, planPhaseTitle: { color: ink, fontSize: 11, fontWeight: '800', letterSpacing: 1.3 }, planPhaseCount: { color: '#92959C', fontSize: 8, fontWeight: '700', letterSpacing: 0.7 }, planPoint: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 13, borderWidth: 1, borderColor: '#ECEDEA', borderRadius: 12, backgroundColor: '#FFF', marginBottom: 7 }, planCheck: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: '#D6D7DC', alignItems: 'center', justifyContent: 'center' }, planCheckDone: { borderColor: '#6658E8', backgroundColor: '#6658E8' }, planCheckMark: { color: '#FFF', fontSize: 13, fontWeight: '800' }, planPointCopy: { flex: 1 }, planPointTitle: { color: ink, fontSize: 12, fontWeight: '700' }, planPointTitleDone: { color: '#858891' }, planPointDetail: { color: muted, fontSize: 10, lineHeight: 15, marginTop: 4 }, planPointArrow: { color: '#A5A7AE', fontSize: 20 },
  detailHero: { height: 184, borderRadius: 18, marginTop: 8, justifyContent: 'center', alignItems: 'center' }, heroLetter: { color: '#FFF', fontSize: 83, fontWeight: '700' }, heroMeta: { color: 'rgba(255,255,255,0.76)', position: 'absolute', bottom: 15, fontSize: 8, letterSpacing: 2, fontWeight: '700' }, backButton: { paddingVertical: 8 }, backText: { color: '#6054D4', fontSize: 13, fontWeight: '600' }, headerLink: { color: '#6054D4', fontSize: 11, fontWeight: '700' }, detailHeading: { marginTop: 19, marginBottom: 15 }, detailNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, detailTitle: { color: ink, fontSize: 30, fontWeight: '700', letterSpacing: -0.8 }, detailActions: { flexDirection: 'row', gap: 8, marginBottom: 18 }, statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }, statBox: { width: '48%', backgroundColor: '#FFF', borderWidth: 1, borderColor: line, borderRadius: 12, padding: 13 }, statValue: { color: ink, fontSize: 21, fontWeight: '700' }, statLabel: { color: '#93969C', fontSize: 8, letterSpacing: 1, marginTop: 5, fontWeight: '700' }, sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 23, marginBottom: 11 }, sectionTitle: { color: ink, fontSize: 15, fontWeight: '700' }, sectionTrailing: { color: '#888B92', fontSize: 8, fontWeight: '700', letterSpacing: 0.7 }, bodyText: { color: '#6D7179', fontSize: 12, lineHeight: 19 }, detailStack: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, infoRow: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: line, flexDirection: 'row', justifyContent: 'space-between' }, infoLabel: { color: muted, fontSize: 11 }, infoValue: { color: ink, fontSize: 11, fontWeight: '600' }, tabsPreview: { marginTop: 22, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: line, gap: 20 }, tabPreviewActive: { color: '#6658E8', fontSize: 11, fontWeight: '700', borderBottomWidth: 2, borderBottomColor: '#6658E8', paddingBottom: 10 }, tabPreviewInactive: { color: '#92959C', fontSize: 11, paddingBottom: 10 },
  portfolioBanner: { backgroundColor: '#23242E', minHeight: 200, borderRadius: 16, padding: 20, justifyContent: 'center', marginBottom: 19 }, portfolioEyebrow: { color: '#A8A4E8', fontSize: 9, letterSpacing: 1.6, fontWeight: '700' }, portfolioHeadline: { color: '#FFF', fontSize: 27, fontWeight: '600', letterSpacing: -0.6, lineHeight: 32, marginTop: 14 }, portfolioCount: { color: '#C5C5CD', fontSize: 8, letterSpacing: 1.4, marginTop: 16 }, portfolioList: { gap: 10 }, portfolioCard: { padding: 13, borderWidth: 1, borderColor: line, borderRadius: 14, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', gap: 11 }, portfolioIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, portfolioIconText: { color: '#FFF', fontWeight: '700', fontSize: 22 }, portfolioTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, portfolioTitle: { color: ink, fontSize: 13, fontWeight: '700' }, featured: { color: '#A1852D', backgroundColor: '#FBF4DF', overflow: 'hidden', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 3, fontSize: 7, letterSpacing: 0.4 }, arrow: { color: '#7D7F87', fontSize: 17 }, portfolioFoot: { color: '#A0A2A7', textAlign: 'center', fontSize: 8, letterSpacing: 1.1, marginTop: 23 },
  remoteContext: { borderWidth: 1, borderColor: line, borderRadius: 14, padding: 14, backgroundColor: '#FFF', marginBottom: 13 }, contextLabel: { color: '#93969C', fontSize: 8, letterSpacing: 1.3, fontWeight: '700', marginBottom: 11 }, contextRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, contextIcon: { width: 37, height: 37, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, contextIconText: { color: '#FFF', fontSize: 18, fontWeight: '700' }, contextName: { color: ink, fontSize: 13, fontWeight: '700' }, contextSub: { color: muted, fontSize: 10, marginTop: 3 }, clearContext: { color: '#9699A0', fontSize: 23, paddingHorizontal: 4 }, remoteComposer: { borderWidth: 1, borderColor: '#E8E6F5', backgroundColor: '#FFF', borderRadius: 15, minHeight: 142, padding: 15 }, composerLabel: { color: '#8A8D96', fontSize: 8, letterSpacing: 1.3, fontWeight: '700' }, composerInput: { color: ink, fontSize: 13, marginTop: 13, minHeight: 48, textAlignVertical: 'top' }, composerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, modelChip: { color: '#6658E8', fontSize: 10, backgroundColor: '#F1F0FA', overflow: 'hidden', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 }, sendButton: { height: 31, width: 31, borderRadius: 10, backgroundColor: '#6658E8', alignItems: 'center', justifyContent: 'center' }, sendText: { color: '#FFF', fontSize: 18, fontWeight: '700' }, quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }, quickCard: { width: '48%', backgroundColor: '#FFF', borderWidth: 1, borderColor: line, borderRadius: 12, padding: 13 }, quickIcon: { color: '#6658E8', fontSize: 17, marginBottom: 9 }, quickTitle: { color: ink, fontSize: 13, fontWeight: '700' }, quickSub: { color: muted, fontSize: 9, marginTop: 3 }, notice: { backgroundColor: '#F0EFF8', padding: 14, borderRadius: 12, marginTop: 17 }, noticeTitle: { color: '#6257CA', fontSize: 11, fontWeight: '700' }, noticeBody: { color: '#777987', fontSize: 10, lineHeight: 15, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 38, paddingHorizontal: 18 }, emptyMark: { color: '#6658E8', fontSize: 31 }, emptyTitle: { color: ink, fontSize: 18, fontWeight: '700', marginTop: 9 }, emptyBody: { color: muted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 5, marginBottom: 17 },
  formField: { marginTop: 22 }, formLabel: { color: '#858992', fontSize: 9, letterSpacing: 1.1, fontWeight: '700', marginBottom: 8 }, formInput: { height: 48, backgroundColor: '#FFF', borderWidth: 1, borderColor: line, borderRadius: 10, paddingHorizontal: 13, color: ink, fontSize: 13 }, formHint: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 22 }, formHintText: { color: '#9699A0', fontSize: 8, letterSpacing: 0.7, fontWeight: '700' }, toast: { position: 'absolute', bottom: 78, left: 24, right: 24, backgroundColor: '#272932', paddingVertical: 13, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center' }, toastText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  label: { color: muted },
  bizRevenueCard: { backgroundColor: '#22242D', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 17 }, bizRevenueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, bizRevenueLabel: { color: '#B6B7C0', fontSize: 9, fontWeight: '700', letterSpacing: 1.4 }, bizRevenueValue: { color: '#FFF', fontSize: 32, fontWeight: '700', marginTop: 4 }, bizProfitBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(91,211,157,0.15)', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6, marginTop: 4 }, bizProfitDot: { color: '#5BD39D', fontSize: 8 }, bizProfitText: { color: '#74DBA9', fontSize: 10, fontWeight: '700' }, bizRevenueStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }, bizRevenueStat: { alignItems: 'center' }, bizRevenueStatValue: { color: '#FFF', fontSize: 16, fontWeight: '700' }, bizRevenueStatLabel: { color: '#9095A0', fontSize: 8, letterSpacing: 1, fontWeight: '700', marginTop: 3 },
  bizSection: { backgroundColor: '#FFF', borderWidth: 1, borderColor: line, borderRadius: 14, padding: 15, marginBottom: 4 },
  bizRevenueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F2F2EF' }, bizRevenueDot: { width: 8, height: 8, borderRadius: 4 }, bizRevenueName: { color: ink, fontSize: 11, fontWeight: '600', minWidth: 70 }, bizRevenueBar: { flex: 1, height: 6, backgroundColor: '#F0F0ED', borderRadius: 3, overflow: 'hidden' }, bizRevenueBarFill: { height: '100%', borderRadius: 3 }, bizRevenueAmount: { color: ink, fontSize: 11, fontWeight: '700', minWidth: 40, textAlign: 'right' }, bizRevenuePct: { color: '#92959C', fontSize: 9, minWidth: 30, textAlign: 'right' },
  bizExpenseRow: { paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F2F2EF' }, bizExpenseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }, bizExpenseName: { color: ink, fontSize: 11, fontWeight: '600' }, bizExpenseAmount: { color: ink, fontSize: 11, fontWeight: '700' }, bizExpenseBar: { height: 6, backgroundColor: '#F0F0ED', borderRadius: 3, overflow: 'hidden' }, bizExpenseBarFill: { height: '100%', borderRadius: 3 }, bizExpenseSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 11, paddingTop: 11, borderTopWidth: 1, borderTopColor: line }, bizExpenseNetLabel: { color: '#93969C', fontSize: 9, letterSpacing: 1, fontWeight: '700' }, bizExpenseNetValue: { fontSize: 14, fontWeight: '700' },
  bizTeamRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F2F2EF' }, bizTeamAvatar: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, bizTeamInitials: { color: '#FFF', fontSize: 12, fontWeight: '800' }, bizTeamName: { color: ink, fontSize: 12, fontWeight: '700' }, bizTeamRole: { color: muted, fontSize: 10, marginTop: 2 }, bizTeamInvite: { alignItems: 'center', paddingVertical: 13, marginTop: 5, borderWidth: 1, borderColor: '#E4E1F6', borderStyle: 'dashed', borderRadius: 11 }, bizTeamInviteText: { color: '#6658E8', fontSize: 11, fontWeight: '700' },
  bizMilestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F2F2EF' }, bizMilestoneDot: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: '#D5D6D2', alignItems: 'center', justifyContent: 'center' }, bizMilestoneDotDone: { backgroundColor: '#18865B', borderColor: '#18865B' }, bizMilestoneDotText: { color: '#FFF', fontSize: 12, fontWeight: '800' }, bizMilestoneLabel: { color: ink, fontSize: 12, fontWeight: '600' }, bizMilestoneLabelDone: { textDecorationLine: 'line-through', color: '#A6A8AF' }, bizMilestoneDate: { color: muted, fontSize: 10, marginTop: 2 },
});
