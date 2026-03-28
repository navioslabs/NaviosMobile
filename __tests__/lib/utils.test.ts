import { distLabel, extractTags, haversineDistance } from "@/lib/utils";

describe("distLabel", () => {
  it("100m未満はメートル表示", () => {
    expect(distLabel(50)).toBe("50m");
    expect(distLabel(99)).toBe("99m");
  });

  it("100m〜1km は10m単位で丸め", () => {
    expect(distLabel(150)).toBe("150m");
    expect(distLabel(456)).toBe("460m");
  });

  it("1km〜10km は小数1桁のkm表示", () => {
    expect(distLabel(1500)).toBe("1.5km");
    expect(distLabel(5678)).toBe("5.7km");
  });

  it("10km以上は整数km表示", () => {
    expect(distLabel(12345)).toBe("12km");
    expect(distLabel(100000)).toBe("100km");
  });

  it("0m", () => {
    expect(distLabel(0)).toBe("0m");
  });
});

describe("extractTags", () => {
  it("ハッシュタグを抽出する", () => {
    expect(extractTags("#渋谷 でランチ #カフェ")).toEqual(["渋谷", "カフェ"]);
  });

  it("重複タグを排除する", () => {
    expect(extractTags("#渋谷 #渋谷")).toEqual(["渋谷"]);
  });

  it("大文字小文字を正規化する", () => {
    expect(extractTags("#Cafe #cafe")).toEqual(["cafe"]);
  });

  it("空文字は空配列を返す", () => {
    expect(extractTags("")).toEqual([]);
  });

  it("null/undefined は空配列を返す", () => {
    expect(extractTags(null)).toEqual([]);
    expect(extractTags(undefined)).toEqual([]);
  });

  it("タグなしテキストは空配列を返す", () => {
    expect(extractTags("タグなしテキスト")).toEqual([]);
  });

  it("句読点で区切られたタグ", () => {
    expect(extractTags("#イベント、#お祭り")).toEqual(["イベント", "お祭り"]);
  });
});

describe("haversineDistance", () => {
  it("同じ座標は0mを返す", () => {
    expect(haversineDistance(35.68, 139.76, 35.68, 139.76)).toBe(0);
  });

  it("東京駅〜渋谷駅は約3.5〜4.5km", () => {
    const d = haversineDistance(35.6812, 139.7671, 35.6580, 139.7016);
    expect(d).toBeGreaterThan(3500);
    expect(d).toBeLessThan(4500);
  });

  it("越谷駅〜越谷レイクタウン駅は約2〜4km", () => {
    const d = haversineDistance(35.8838, 139.7906, 35.8700, 139.8230);
    expect(d).toBeGreaterThan(2000);
    expect(d).toBeLessThan(4000);
  });
});
