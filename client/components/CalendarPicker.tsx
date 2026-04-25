import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "../hooks/useColors";

interface CalendarPickerProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  markedDates?: Record<string, { present: number; absent: number }>;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarPicker({ selectedDate, onSelectDate, markedDates = {} }: CalendarPickerProps) {
  const colors = useColors();
  const today = new Date().toISOString().split("T")[0];

  const parsedSelected = new Date(selectedDate + "T00:00:00");
  const [viewYear, setViewYear] = useState(parsedSelected.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedSelected.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const makeDate = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  };

  const isToday = (day: number) => makeDate(day) === today;
  const isSelected = (day: number) => makeDate(day) === selectedDate;
  const isFuture = (day: number) => makeDate(day) > today;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card, borderRadius: colors.radius + 2,
      borderWidth: 1, borderColor: colors.border, overflow: "hidden",
    },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    monthTitle: {
      flex: 1, textAlign: "center", fontSize: 15, fontWeight: "700",
      color: colors.foreground, fontFamily: "Inter_700Bold",
    },
    navBtn: {
      width: 32, height: 32, borderRadius: 8,
      backgroundColor: colors.background, alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.border,
    },
    dayHeaders: {
      flexDirection: "row", paddingHorizontal: 8, paddingVertical: 8,
    },
    dayHeader: {
      flex: 1, alignItems: "center",
    },
    dayHeaderText: {
      fontSize: 11, fontWeight: "600", color: colors.mutedForeground,
      fontFamily: "Inter_600SemiBold",
    },
    grid: { paddingHorizontal: 8, paddingBottom: 12 },
    row: { flexDirection: "row" },
    cell: { flex: 1, alignItems: "center", paddingVertical: 5 },
    dayBtn: {
      width: 34, height: 34, borderRadius: 17,
      alignItems: "center", justifyContent: "center",
    },
    dayToday: {
      borderWidth: 1.5, borderColor: colors.primary,
    },
    daySelected: {
      backgroundColor: colors.primary,
    },
    dayNum: {
      fontSize: 13, fontWeight: "500", color: colors.foreground, fontFamily: "Inter_500Medium",
    },
    dayNumSelected: { color: "#ffffff", fontWeight: "700", fontFamily: "Inter_700Bold" },
    dayNumToday: { color: colors.primary, fontWeight: "700", fontFamily: "Inter_700Bold" },
    dayNumFuture: { color: colors.mutedForeground },
    dot: { width: 5, height: 5, borderRadius: 3, marginTop: 1 },
  });

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
          <Feather name="chevron-left" size={16} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
          <Feather name="chevron-right" size={16} color={colors.foreground} />
        </TouchableOpacity>
      </View>
      <View style={styles.dayHeaders}>
        {DAYS.map(d => (
          <View key={d} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{d}</Text>
          </View>
        ))}
      </View>
      <View style={styles.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((day, di) => {
              if (!day) return <View key={di} style={styles.cell} />;
              const dateStr = makeDate(day);
              const marked = markedDates[dateStr];
              const sel = isSelected(day);
              const tod = isToday(day);
              const fut = isFuture(day);
              return (
                <View key={di} style={styles.cell}>
                  <TouchableOpacity
                    style={[
                      styles.dayBtn,
                      tod && !sel && styles.dayToday,
                      sel && styles.daySelected,
                    ]}
                    onPress={() => !fut && onSelectDate(dateStr)}
                    disabled={fut}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dayNum,
                      tod && !sel && styles.dayNumToday,
                      sel && styles.dayNumSelected,
                      fut && styles.dayNumFuture,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                  {marked && (
                    <View style={[styles.dot, {
                      backgroundColor: marked.present > 0 ? "#16a34a" : "#dc2626"
                    }]} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
