import { Button } from "heroui-native";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Backdrop } from "../components/shared";
import { styles } from "../theme/styles";

export function PublicSite() {
  return (
    <View style={styles.publicPage}>
      <Backdrop />
      <SafeAreaView style={styles.publicSafe} edges={["top", "bottom"]}>
        <View style={styles.publicHeader}><Image source={{ uri: "/brand/cbf1488-mascot.png" }} style={styles.publicLogo} /><Text style={styles.publicBrand}>CBF1488</Text><View style={styles.headerSpacer} /><Text style={styles.publicNav}>社区篮球</Text></View>
        <View style={styles.publicHero}>
          <Text style={styles.publicEyebrow}>COMMUNITY BASKETBALL</Text>
          <Text style={styles.publicTitle}>让每一场比赛，{ "\n" }都有熟悉的队友。</Text>
          <Text style={styles.publicCopy}>CBF1488 社区篮球活动、队员与出勤信息入口。</Text>
          <Button variant="primary" onPress={() => { if (typeof window !== "undefined") window.location.assign("/?surface=mini"); }} className="mt-7 rounded-xl bg-[#1d4ed8] px-6 py-3">
            <Button.Label className="text-white">进入活动报名</Button.Label>
          </Button>
        </View>
        <View style={styles.publicFooter}><Text style={styles.publicCopy}>CBF1488 · Community Basketball</Text><Text style={styles.publicCopy}>比赛报名　·　出勤榜　·　队员资料</Text></View>
      </SafeAreaView>
    </View>
  );
}
