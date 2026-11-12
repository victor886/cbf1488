import { useState } from "react";
import { Button, Card, Chip, Input } from "heroui-native";
import { DateTimePicker, type DateTimePickerOption } from "@agile-avocation/ui-native-pro/date-time-picker";
import type { CalendarDateTime } from "@internationalized/date";
import { Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { api, assetUrl } from "../api";
import { FormField, MessageState, PageFrame, PageHeader } from "../components/shared";
import { styles } from "../theme/styles";
import { addHours, formatDateTime, timeAt, tomorrowDate } from "../utils/date";

export function CreateMatchScreen({ onBack, onCreated }: { onBack: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [selectedDate, setSelectedDate] = useState(tomorrowDate());
  const [startTime, setStartTime] = useState("19:30");
  const [timeSelected, setTimeSelected] = useState(false);
  const [timeScreen, setTimeScreen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaBusy, setMediaBusy] = useState(false);
  const [error, setError] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [busy, setBusy] = useState(false);

  const startAt = timeAt(selectedDate, startTime);
  const endAt = addHours(startAt, 2);
  const signupDeadline = addHours(startAt, -1);

  function nextStep() {
    if (!title.trim() || !timeSelected || !location.trim() || Number(capacity) < 2 || !signupDeadline) {
      setShowValidation(true);
      setError("请完善比赛名称、时间、地点和人数");
      return;
    }
    setError("");
    setShowValidation(false);
    setStep(2);
  }

  function previousStep() {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else onBack();
  }

  function openMediaPicker(kind: "image" | "video") {
    if (Platform.OS !== "web") return setError("请在网页中选择媒体文件");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "image" ? "image/*" : "video/*";
    input.multiple = kind === "image";
    input.onchange = async () => {
      const selected = Array.from(input.files || []);
      if (!selected.length) return;
      setMediaBusy(true);
      setError("");
      try {
        if (kind === "image") {
          const remaining = Math.max(0, 9 - images.length);
          const uploads = await Promise.all(selected.slice(0, remaining).map((file) => api.uploadMedia(file)));
          setImages((current) => [...current, ...uploads.map((item) => item.url)].slice(0, 9));
        } else {
          const upload = await api.uploadMedia(selected[0]);
          setVideoUrl(upload.url);
        }
      } catch (reason) {
        setError((reason as Error).message);
      } finally {
        setMediaBusy(false);
      }
    };
    input.click();
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api.createMatch({
        title,
        location,
        description,
        tags: ["5人制", "均衡分组", "新人友好"],
        maxPlayers: Number(capacity),
        startAt,
        endAt,
        signupDeadline,
        coverUrl: images[0] || "",
        images,
        videoUrl,
      });
      onCreated();
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (timeScreen) {
    return <SelectMatchTimeScreen date={selectedDate} startTime={startTime} onBack={() => setTimeScreen(false)} onConfirm={(date, time) => { setSelectedDate(date); setStartTime(time); setTimeSelected(true); setTimeScreen(false); setError(""); }} />;
  }

  if (step === 2) {
    return (
      <PageFrame>
        <View style={styles.screen}>
          <PageHeader title="补充比赛信息" onBack={previousStep} />
          <ScrollView contentContainerStyle={styles.optionalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.formStep}>2 / 2 比赛内容</Text>
            <View style={styles.optionalTags}>{["5人制", "均衡分组", "新人友好"].map((tag) => <Chip key={tag} color="default" variant="soft" size="sm" className="bg-white/10"><Chip.Label className="text-[#b0c9e3]">{tag}</Chip.Label></Chip>)}</View>
            <FormField label="比赛说明（选填）"><Input accessibilityLabel="比赛说明" value={description} onChangeText={setDescription} placeholder="友谊交流，按到场情况均衡分组。" placeholderTextColor="#b0c9e3" style={styles.figmaInput} className="rounded-2xl bg-white/10 px-3 text-[#f5fcff]" /></FormField>
            <Card style={styles.mediaCard} className="rounded-3xl border border-white/20 bg-[#22395d] p-4">
              <Text style={styles.mediaTitle}>图片与视频</Text>
              <Text style={styles.mediaCaption}>选填 · 不添加也可发布</Text>
              {images.length || videoUrl ? <View style={styles.mediaSummary}>
                {images.map((url, index) => <Pressable key={`${url}-${index}`} onPress={() => setImages((items) => items.filter((_, imageIndex) => imageIndex !== index))} style={styles.mediaItem}>
                  <Image source={{ uri: assetUrl(url) }} style={styles.mediaThumbnail} />
                  <Text style={styles.mediaItemLabel}>图片 {index + 1}　移除 ×</Text>
                </Pressable>)}
                {videoUrl ? <Pressable onPress={() => setVideoUrl("")} style={styles.mediaItem}><View style={styles.videoThumbnail}><Text style={styles.videoSymbol}>▶</Text></View><Text style={styles.mediaItemLabel}>视频　移除 ×</Text></Pressable> : null}
              </View> : null}
              <View style={styles.mediaActions}>
                <Button isDisabled={mediaBusy || images.length >= 9} variant="secondary" onPress={() => openMediaPicker("image")} className="h-12 flex-1 rounded-2xl bg-white/10"><Button.Label className="text-white">{mediaBusy ? "上传中…" : "+ 图片"}</Button.Label></Button>
                <Button isDisabled={mediaBusy || Boolean(videoUrl)} variant="secondary" onPress={() => openMediaPicker("video")} className="h-12 flex-1 rounded-2xl bg-white/10"><Button.Label className="text-white">{mediaBusy ? "上传中…" : "+ 视频"}</Button.Label></Button>
              </View>
            </Card>
            <Text style={styles.optionalNote}>报名免费 · 沿用社区预付费方式</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>
          <View style={styles.detailAction}><Button isDisabled={mediaBusy} variant="primary" onPress={() => { setStep(3); setError(""); }} className="h-12 w-full rounded-xl bg-[#1d4ed8]"><Button.Label className="text-white">预览比赛</Button.Label></Button></View>
        </View>
      </PageFrame>
    );
  }

  if (step === 3) {
    return (
      <PageFrame>
        <View style={styles.screen}>
          <PageHeader title="发布预览" onBack={previousStep} />
          <ScrollView contentContainerStyle={styles.previewScroll} showsVerticalScrollIndicator={false}>
            <Card style={styles.previewCard} className="rounded-3xl border border-white/20 bg-[#22395d] p-4">
              <View style={styles.previewStatus}><Text style={styles.previewStatusText}>未开始</Text></View>
              <Text style={styles.previewTitle}>{title}</Text>
              <Text style={styles.previewMeta}>{formatDateTime(startAt).date} {formatDateTime(startAt).weekday} · {formatDateTime(startAt).time}–{formatDateTime(endAt).time}</Text>
              <Image source={{ uri: assetUrl(images[0]) || "/static/covers/create-match-hoop.png" }} style={styles.previewImage} resizeMode="cover" />
              <Text style={styles.previewMeta}>{location}</Text>
              <View style={styles.tagRow}>{["5人制", "均衡分组", "新人友好"].map((tag) => <Chip key={tag} color="default" variant="soft" size="sm" className="bg-white/10"><Chip.Label className="text-[#b0c9e3]">{tag}</Chip.Label></Chip>)}</View>
              <View style={styles.previewDetailRow}><Text style={styles.previewRowLabel}>报名上限</Text><Text style={styles.previewRowValue}>{capacity} 人</Text></View>
              <View style={styles.previewDetailRow}><Text style={styles.previewRowLabel}>截止报名</Text><Text style={styles.previewRowValue}>{formatDateTime(signupDeadline).date} {formatDateTime(signupDeadline).time}</Text></View>
              {description ? <Text style={styles.previewDescription}>{description}</Text> : null}
              {videoUrl ? <Text style={styles.previewDescription}>已添加比赛视频</Text> : null}
            </Card>
            <Text style={styles.previewFootnote}>图片、视频与说明均可留空</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>
          <View style={styles.detailAction}><Button isDisabled={busy} variant="primary" onPress={() => { void submit(); }} className="h-12 w-full rounded-xl bg-[#1d4ed8]"><Button.Label className="text-white">{busy ? "正在发布…" : "确认发布"}</Button.Label></Button></View>
        </View>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <View style={styles.screen}>
        <PageHeader title="新建比赛" onBack={previousStep} />
        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.formStep}>1 / 2 基本信息</Text>
          <FormField label="比赛名称 *"><Input accessibilityLabel="比赛名称" value={title} onChangeText={setTitle} placeholder="请输入比赛名称" placeholderTextColor="#b0c9e3" style={styles.figmaInput} className="rounded-2xl bg-white/10 px-3 text-[#f5fcff]" /></FormField>
          <FormField label="比赛时间 *"><Pressable onPress={() => setTimeScreen(true)}><Input accessibilityLabel="比赛时间" editable={false} value={timeSelected ? `${formatDateTime(startAt).date} ${formatDateTime(startAt).time}–${formatDateTime(endAt).time}` : ""} placeholder="请选择开始与结束时间" placeholderTextColor="#b0c9e3" style={styles.figmaInput} className="rounded-2xl bg-white/10 px-3 text-[#f5fcff]" /></Pressable></FormField>
          <FormField label="比赛地点 *"><Input accessibilityLabel="比赛地点" value={location} onChangeText={setLocation} placeholder="请输入场地名称与地址" placeholderTextColor="#b0c9e3" style={styles.figmaInput} className="rounded-2xl bg-white/10 px-3 text-[#f5fcff]" /></FormField>
          <FormField label="最大人数 *"><Input accessibilityLabel="最大人数" keyboardType="number-pad" value={capacity} onChangeText={setCapacity} placeholder="请输入最大报名人数" placeholderTextColor="#b0c9e3" style={styles.figmaInput} className="rounded-2xl bg-white/10 px-3 text-[#f5fcff]" /></FormField>
          <FormField label="报名截止 *"><Pressable onPress={() => setTimeScreen(true)}><Input accessibilityLabel="报名截止时间" editable={false} value={timeSelected ? `${formatDateTime(signupDeadline).date} ${formatDateTime(signupDeadline).time}` : ""} placeholder="请选择报名截止时间" placeholderTextColor="#b0c9e3" style={styles.figmaInput} className="rounded-2xl bg-white/10 px-3 text-[#f5fcff]" /></Pressable></FormField>
          {showValidation ? <Text style={styles.validationText}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.detailAction}><Button variant="primary" onPress={nextStep} className="h-12 w-full rounded-xl bg-[#1d4ed8]"><Button.Label className="text-white">下一步</Button.Label></Button></View>
      </View>
    </PageFrame>
  );
}

function SelectMatchTimeScreen({ date, startTime, onBack, onConfirm }: { date: string; startTime: string; onBack: () => void; onConfirm: (date: string, time: string) => void }) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedTime, setSelectedTime] = useState(startTime);
  const startAt = timeAt(selectedDate, selectedTime);
  const endAt = addHours(startAt, 2);
  const deadline = addHours(startAt, -1);
  const dateValue = { value: startAt.slice(0, 19), label: formatDateTime(startAt).date };

  return (
    <PageFrame>
      <View style={styles.screen}>
        <PageHeader title="选择比赛时间" onBack={onBack} />
        <View style={styles.timePickerContent}>
          <Text style={styles.timePickerHint}>选择开始与结束时间</Text>
          <Card style={styles.timePickerCard} className="rounded-3xl border border-white/20 bg-[#22395d] p-4">
            <DateTimePicker
              value={dateValue}
              hourFormat={24}
              minuteInterval={5}
              locale="zh-CN"
              formatDateTime={(value: CalendarDateTime) => {
                const weekday = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", weekday: "short" }).format(new Date(`${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}T12:00:00+08:00`));
                return `${value.year}年${value.month}月${value.day}日 ${weekday}`;
              }}
              onValueChange={(value: DateTimePickerOption | undefined) => { if (value) setSelectedDate(value.value.slice(0, 10)); }}
            >
              <DateTimePicker.Select>
                <DateTimePicker.Trigger style={styles.dateLabelTrigger}><DateTimePicker.Value className="text-[18px] font-medium text-[#f5fcff]" /></DateTimePicker.Trigger>
                <DateTimePicker.Portal>
                  <DateTimePicker.Overlay />
                  <DateTimePicker.Content presentation="popover" width="trigger"><DateTimePicker.Wheel /></DateTimePicker.Content>
                </DateTimePicker.Portal>
              </DateTimePicker.Select>
            </DateTimePicker>
            <View style={styles.timeRow}><Text style={styles.timeLabel}>开始时间</Text><Text style={styles.timeValue}>{selectedTime.replace(":", " : ")}</Text></View>
            <View style={styles.timeRow}><Text style={styles.timeLabel}>结束时间</Text><Text style={styles.timeValue}>{formatDateTime(endAt).time.replace(":", " : ")}</Text></View>
            <Text style={styles.deadlineLabel}>报名截止　{formatDateTime(deadline).date} {formatDateTime(deadline).time}</Text>
            <View style={styles.timeChipRow}>
              {["18:30", "19:30", "20:30"].map((time) => (
                <Pressable key={time} onPress={() => setSelectedTime(time)}>
                  <Chip color={selectedTime === time ? "accent" : "default"} variant={selectedTime === time ? "primary" : "soft"} size="sm" className={selectedTime === time ? "bg-[#1d4ed8]" : "bg-white/10"}>
                    <Chip.Label className={selectedTime === time ? "text-white" : "text-[#b0c9e3]"}>{time}</Chip.Label>
                  </Chip>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>
        <View style={styles.detailAction}><Button variant="primary" onPress={() => onConfirm(selectedDate, selectedTime)} className="h-12 w-full rounded-xl bg-[#1d4ed8]"><Button.Label className="text-white">确定时间</Button.Label></Button></View>
      </View>
    </PageFrame>
  );
}
