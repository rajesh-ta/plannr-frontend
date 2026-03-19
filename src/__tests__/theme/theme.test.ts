import theme from "@/theme/theme";

describe("theme", () => {
  it("is a valid MUI theme object", () => {
    expect(theme).toBeDefined();
    expect(typeof theme).toBe("object");
  });

  it("has the correct primary colour", () => {
    expect(theme.palette.primary.main).toBe("#9775fa");
  });

  it("has the correct secondary colour", () => {
    expect(theme.palette.secondary.main).toBe("#f06595");
  });

  it("MUI augments primary with light, dark, and contrastText", () => {
    expect(theme.palette.primary.light).toBeDefined();
    expect(theme.palette.primary.dark).toBeDefined();
    expect(theme.palette.primary.contrastText).toBeDefined();
  });

  it("MUI augments secondary with light, dark, and contrastText", () => {
    expect(theme.palette.secondary.light).toBeDefined();
    expect(theme.palette.secondary.dark).toBeDefined();
    expect(theme.palette.secondary.contrastText).toBeDefined();
  });

  it("exposes a breakpoints object", () => {
    expect(theme.breakpoints).toBeDefined();
    expect(typeof theme.breakpoints.up).toBe("function");
    expect(typeof theme.breakpoints.down).toBe("function");
  });

  it("exposes a typography object", () => {
    expect(theme.typography).toBeDefined();
    expect(typeof theme.typography.pxToRem).toBe("function");
  });

  it("exposes a spacing function", () => {
    expect(typeof theme.spacing).toBe("function");
    expect(theme.spacing(1)).toBeTruthy();
  });

  it("exposes a shadows array", () => {
    expect(Array.isArray(theme.shadows)).toBe(true);
    expect(theme.shadows.length).toBeGreaterThan(0);
  });

  it("exposes a zIndex object with common keys", () => {
    expect(theme.zIndex).toBeDefined();
    expect(typeof theme.zIndex.drawer).toBe("number");
    expect(typeof theme.zIndex.appBar).toBe("number");
    expect(typeof theme.zIndex.modal).toBe("number");
  });
});
