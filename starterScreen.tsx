import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Svg, { G, Circle } from "react-native-svg";
import { AntDesign } from "@expo/vector-icons";

import { CreateAccountHeader, Row, Screen, SubmitBtn } from "@/components";
import { COLORS, images, ROUTES, SIZES } from "@/constants";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { onboardData } from "@/data/onboarding";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveValueToStorage } from "@/utils";

const StarterScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<any>(null);
  const [currentIndex, setcurrentIndex] = useState(0);

  const viewableItemsChange = useRef(
    ({ viewableItems }: { viewableItems: any }) => {
      setcurrentIndex(viewableItems[0].index);
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  
  const scrollTo = () => {
    if (currentIndex < onboardData?.length - 1) {
      slidesRef?.current.scrollToIndex({
        index: currentIndex + 1,
      });
    } else {
      //save to
      saveValueToStorage("true", "boarded");
      navigation.dispatch(CommonActions.navigate(ROUTES.signUp));
    }
  };

  const OnboardingItem = ({ item }: { item: any }) => {
    return (
      <View style={[styles.onboardingItem, { width }]}>
        <Image
          source={item?.img}
          style={[styles?.image, { width, resizeMode: "contain" }]}
        />
        <View style={styles.textContainer}>
          <Text style={styles?.title}>{item?.title}</Text>
          <Text style={styles?.subTitle}>{item?.subTitle}</Text>
        </View>
      </View>
    );
  };

  const Paginator = ({ data, scrollX }: { data: any; scrollX: any }) => {
    return (
      <View style={styles.paginator}>
        {data?.map((_: any, i: any) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width]; //prevDot, presentDot, NextDot
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: "clamp",
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
              key={i.toString()}
            />
          );
        })}
      </View>
    );
  };
  const NextButton = ({
    percentage,
    scrollTo,
  }: {
    percentage: any;
    scrollTo: () => void;
  }) => {
    const size = 128;
    const strokeWidth = 2;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    const progressAnim = useRef(new Animated.Value(0)).current;
    const progressRef = useRef<any>(null);

    const animation = (toValue: any) => {
      return Animated.timing(progressAnim, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    useEffect(() => {
      animation(percentage);
    }, [percentage]);

    useEffect(() => {
      progressAnim.addListener(
        (value) => {
          const strokeDashoffset =
            circumference - (circumference * value?.value) / 100;

          if (progressRef?.current) {
            progressRef?.current?.setNativeProps({
              strokeDashoffset,
            });
          }
        }
        // [percentage]
      );
      return () => {
        progressAnim.removeAllListeners();
      };
    }, []);

    return (
      <View style={styles.nextButton}>
        <Svg width={size} height={size}>
          <G rotation={"-90"} origin={center}>
            <Circle
              stroke="#E6E7E8"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke="#F4338F"
              cx={center}
              cy={center}
              ref={progressRef}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
            />
          </G>
        </Svg>
        <TouchableOpacity
          style={styles.button}
          onPress={scrollTo}
          activeOpacity={0.6}
        >
          <AntDesign name="arrowright" size={32} color="white" />
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 3 }}>
        <FlatList
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChange}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
          data={onboardData}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          keyExtractor={(item) => item?.id.toString()}
          bounces={false}
          horizontal
          ref={slidesRef}
        />
      </View>
      <Paginator data={onboardData} scrollX={scrollX} />
      <NextButton
        percentage={((currentIndex + 1) * 100) / onboardData?.length}
        scrollTo={scrollTo}
      />
    </SafeAreaView>
  );
};

export default StarterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  onboardingItem: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    flex: 0.3,
  },
  title: {
    fontWeight: "800",
    fontSize: 28,
    marginBottom: 10,
    color: "#493d8a",
    textAlign: "center",
  },
  subTitle: {
    fontWeight: "300",
    paddingHorizontal: 64,
    color: "#62656b",
    textAlign: "center",
  },
  image: {
    flex: 0.7,
    justifyContent: "center",
  },
  paginator: {
    flexDirection: "row",
    height: 64,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#493d8a",
    marginHorizontal: 8,
  },
  nextButton: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  button: {
    position: "absolute",
    borderRadius: 100,
    padding: 20,
    backgroundColor: "#f43338f",
  },
});
