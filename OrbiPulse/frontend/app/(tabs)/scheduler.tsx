import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  INITIAL_SCHEDULES,
  IrrigationSchedule,
  DAYS_OF_WEEK,
} from '../../data/mockData';
import { Colors, Spacing, Radius, FontSize, COLORS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useValves } from '../../context/ValveContext';
import { useLanguage } from '../../context/LanguageContext';

let nextId = 10;

export default function SchedulerScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { valves } = useValves();
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>(INITIAL_SCHEDULES);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<IrrigationSchedule | null>(null);

  // Form state
  const [formValveId, setFormValveId]     = useState(valves[0]?.device_id || '');
  const [formStartTime, setFormStartTime] = useState('06:00');
  const [formDuration, setFormDuration]   = useState('30');
  const [formDays, setFormDays]           = useState<string[]>(['Mon', 'Wed', 'Fri']);

  const openCreate = () => {
    setEditTarget(null);
    setFormValveId(valves[0]?.device_id || '');
    setFormStartTime('06:00');
    setFormDuration('30');
    setFormDays(['Mon', 'Wed', 'Fri']);
    setShowModal(true);
  };

  const openEdit = (s: IrrigationSchedule) => {
    setEditTarget(s);
    setFormValveId(s.valve_id);
    setFormStartTime(s.start_time);
    setFormDuration(String(s.duration_minutes));
    setFormDays([...s.days]);
    setShowModal(true);
  };

  const saveSchedule = () => {
    if (!formStartTime.match(/^\d{2}:\d{2}$/)) {
      Alert.alert(t('invalid_time'), t('invalid_time_msg'));
      return;
    }
    const dur = parseInt(formDuration, 10);
    if (isNaN(dur) || dur < 1 || dur > 240) {
      Alert.alert(t('invalid_duration'), t('invalid_duration_msg'));
      return;
    }
    if (formDays.length === 0) {
      Alert.alert(t('no_days'), t('no_days_msg'));
      return;
    }
    const valve = valves.find((v) => v.device_id === formValveId)!;

    if (editTarget) {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === editTarget.id
            ? { ...s, valve_id: formValveId, valve_name: valve.name, start_time: formStartTime, duration_minutes: dur, days: formDays }
            : s,
        ),
      );
    } else {
      const newSchedule: IrrigationSchedule = {
        id: `S-${String(nextId++).padStart(3, '0')}`,
        valve_id: formValveId,
        valve_name: valve.name,
        start_time: formStartTime,
        duration_minutes: dur,
        days: formDays,
        enabled: true,
        created_at: new Date().toISOString(),
      };
      setSchedules((prev) => [...prev, newSchedule]);
    }
    setShowModal(false);
  };

  const deleteSchedule = (id: string) => {
    Alert.alert(t('delete_schedule'), t('delete_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => setSchedules((prev) => prev.filter((s) => s.id !== id)) },
    ]);
  };

  const toggleEnabled = (id: string) => {
    setSchedules((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const toggleDay = (day: string) => {
    setFormDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const activeSchedules  = schedules.filter((s) => s.enabled);
  const totalMinutesDay  = activeSchedules.reduce((sum, s) => {
    const daysPerWeek = s.days.length;
    return sum + (s.duration_minutes * daysPerWeek) / 7;
  }, 0);

  // Group by zone based on valve
  const todayAbbr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  const todaySchedules = schedules.filter((s) => s.enabled && s.days.includes(todayAbbr));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Page Action Bar */}
        <View style={styles.actionHeader}>
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.addBtnText}>{t('new_schedule')}</Text>
          </TouchableOpacity>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{schedules.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('total')}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{activeSchedules.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('active')}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>{todaySchedules.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('today')}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryValue, { color: COLORS.warning }]}>{Math.round(totalMinutesDay)}m</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('avg_day')}</Text>
          </View>
        </View>

        {/* Today's schedule */}
        {todaySchedules.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('today')} — {todayAbbr.toUpperCase()}</Text>
            {todaySchedules
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((s) => (
                <TodayCard key={s.id} schedule={s} onEdit={() => openEdit(s)} />
              ))}
          </>
        )}        {/* All schedules */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('all_schedules')}</Text>
        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>{t('no_schedules')}</Text>
            <Text style={styles.emptyText}>{t('tap_to_automate')}</Text>
          </View>
        ) : (
          schedules.map((s) => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              onToggle={() => toggleEnabled(s.id)}
              onEdit={() => openEdit(s)}
              onDelete={() => deleteSchedule(s.id)}
            />
          ))
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Create / Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editTarget ? t('edit_schedule') : t('new_schedule')}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Valve selection */}
            <Text style={styles.fieldLabel}>{t('valve')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.valveScroll}>
              {valves.filter((v) => v.status !== 'offline').map((v) => (
                <TouchableOpacity
                  key={v.device_id}
                  style={[
                    styles.valveOption,
                    formValveId === v.device_id && styles.valveOptionActive,
                  ]}
                  onPress={() => setFormValveId(v.device_id)}
                >
                  <Text style={[styles.valveOptionId, formValveId === v.device_id && { color: COLORS.primary }]}>
                    {v.device_id}
                  </Text>
                  <Text style={styles.valveOptionName} numberOfLines={1}>{v.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Start time */}
            <Text style={styles.fieldLabel}>{t('start_time')}</Text>
            <TextInput
              style={styles.textInput}
              value={formStartTime}
              onChangeText={setFormStartTime}
              placeholder="06:00"
              placeholderTextColor={COLORS.dark}
              keyboardType="numbers-and-punctuation"
            />

            {/* Duration */}
            <Text style={styles.fieldLabel}>{t('duration_min')}</Text>
            <TextInput
              style={styles.textInput}
              value={formDuration}
              onChangeText={setFormDuration}
              placeholder="30"
              placeholderTextColor={COLORS.dark}
              keyboardType="number-pad"
            />

            {/* Days */}
            <Text style={styles.fieldLabel}>{t('days')}</Text>
            <View style={styles.daysRow}>
              {DAYS_OF_WEEK.map((day) => {
                const active = formDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick presets */}
            <Text style={styles.fieldLabel}>{t('quick_presets')}</Text>
            <View style={styles.presetsRow}>
              {[
                { label: t('every_day'), days: DAYS_OF_WEEK },
                { label: t('weekdays'), days: ['Mon','Tue','Wed','Thu','Fri'] },
                { label: t('weekends'), days: ['Sat','Sun'] },
                { label: t('alt_days'), days: ['Mon','Wed','Fri'] },
              ].map(({ label, days }) => (
                <TouchableOpacity
                  key={label}
                  style={styles.presetBtn}
                  onPress={() => setFormDays(days)}
                >
                  <Text style={styles.presetText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>{t('schedule_preview')}</Text>
              <Text style={styles.previewText}>
                {t('preview_message')
                  .replace('{name}', valves.find((v) => v.device_id === formValveId)?.name || '')
                  .replace('{time}', formStartTime)
                  .replace('{dur}', formDuration)
                  .replace('{days}', formDays.join(', ') || '—')}
              </Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveSchedule}>
              <Ionicons name="checkmark" size={20} color={Colors.bg} />
              <Text style={styles.saveBtnText}>{editTarget ? t('update_schedule') : t('create_schedule')}</Text>
            </TouchableOpacity>

            <View style={{ height: Spacing.xl }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TodayCard({ schedule, onEdit }: { schedule: IrrigationSchedule; onEdit: () => void }) {
  const { t } = useLanguage();
  const [hh, mm] = schedule.start_time.split(':').map(Number);
  const endMin = hh * 60 + mm + schedule.duration_minutes;
  const endH = Math.floor(endMin / 60) % 24;
  const endM = endMin % 60;
  const endStr = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;

  return (
    <TouchableOpacity style={styles.todayCard} onPress={onEdit}>
      <View style={styles.todayTime}>
        <Text style={styles.todayStart}>{schedule.start_time}</Text>
        <View style={styles.todayBar} />
        <Text style={styles.todayEnd}>{endStr}</Text>
      </View>
      <View style={styles.todayInfo}>
        <Text style={styles.todayValve}>{schedule.valve_name}</Text>
        <Text style={styles.todayDuration}>{schedule.duration_minutes} {t('min')}</Text>
      </View>
      <View style={styles.todayDot} />
    </TouchableOpacity>
  );
}

function ScheduleCard({
  schedule,
  onToggle,
  onEdit,
  onDelete,
}: {
  schedule: IrrigationSchedule;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useLanguage();
  return (
    <View style={[styles.scheduleCard, !schedule.enabled && styles.scheduleCardDisabled]}>
      <View style={styles.scheduleMain}>
        <View style={styles.scheduleTop}>
          <Text style={styles.scheduleValve}>{schedule.valve_name}</Text>
          <Switch
            value={schedule.enabled}
            onValueChange={onToggle}
            thumbColor={schedule.enabled ? Colors.accent : Colors.textMuted}
            trackColor={{ false: Colors.border, true: Colors.accent + '44' }}
            style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
          />
        </View>
        <Text style={styles.scheduleId}>{schedule.valve_id} · {schedule.id}</Text>
        <View style={styles.scheduleDetails}>
          <View style={styles.scheduleDetailItem}>
            <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.scheduleDetailText}>{schedule.start_time}</Text>
          </View>
          <View style={styles.scheduleDetailItem}>
            <Ionicons name="hourglass-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.scheduleDetailText}>{schedule.duration_minutes} {t('min')}</Text>
          </View>
        </View>
        <View style={styles.daysChips}>
          {DAYS_OF_WEEK.map((d) => (
            <View
              key={d}
              style={[
                styles.miniDayChip,
                schedule.days.includes(d) && schedule.enabled && styles.miniDayChipActive,
              ]}
            >
              <Text style={[
                styles.miniDayText,
                schedule.days.includes(d) && schedule.enabled && styles.miniDayTextActive,
              ]}>
                {d[0]}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.scheduleActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color={Colors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  actionHeader: {
    flexDirection: 'row-reverse',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 1 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  addBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.bg },

  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent + '44',
    gap: Spacing.md,
  },
  todayTime: { alignItems: 'center', gap: 3 },
  todayStart: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent },
  todayBar: { width: 2, height: 20, backgroundColor: Colors.accent + '44', borderRadius: 1 },
  todayEnd: { fontSize: FontSize.xs, color: Colors.textMuted },
  todayInfo: { flex: 1 },
  todayValve: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  todayDuration: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  todayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },

  scheduleCard: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  scheduleCardDisabled: { opacity: 0.55 },
  scheduleMain: { flex: 1, padding: Spacing.md },
  scheduleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scheduleValve: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  scheduleId: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1, marginBottom: Spacing.sm },
  scheduleDetails: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  scheduleDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scheduleDetailText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  daysChips: { flexDirection: 'row', gap: 4 },
  miniDayChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniDayChipActive: { backgroundColor: Colors.accent + '22', borderColor: Colors.accent },
  miniDayText: { fontSize: 9, fontWeight: '700', color: Colors.textMuted },
  miniDayTextActive: { color: Colors.accent },
  scheduleActions: {
    width: 44,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    backgroundColor: Colors.surfaceHigh,
  },
  actionBtn: { padding: Spacing.xs },

  emptyState: { alignItems: 'center', padding: Spacing.xxl },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.md },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },

  // Modal
  modalSafe: { flex: 1, backgroundColor: Colors.surface },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  modalBody: { flex: 1, padding: Spacing.md },

  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  valveScroll: { marginBottom: Spacing.sm },
  valveOption: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    backgroundColor: Colors.bg,
    minWidth: 80,
  },
  valveOptionActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '18' },
  valveOptionId: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textSecondary },
  valveOptionName: { fontSize: 10, color: Colors.textMuted, marginTop: 2, width: 80 },

  textInput: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    padding: Spacing.md,
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
  },

  daysRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  dayChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
    minWidth: 44,
    alignItems: 'center',
  },
  dayChipActive: { backgroundColor: Colors.accent + '22', borderColor: Colors.accent },
  dayText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted },
  dayTextActive: { color: Colors.accent },

  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  presetBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetText: { fontSize: FontSize.xs, color: Colors.textSecondary },

  previewBox: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.xs },
  previewText: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  saveBtnText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.bg },
});
