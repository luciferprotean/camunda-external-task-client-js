const { File } = require("../index");
const { MISSING_FILE_OPTIONS } = require("./__internal/errors");

describe("File", () => {
  describe("constructor", () => {
    it("should throw Error when neither localPath nor typedValue are provided", () => {
      expect(() => new File()).toThrowError(MISSING_FILE_OPTIONS);
    });

    it("should create instance with proper values when typedValue is provided", () => {
      // given
      const typedValue = {
        valueInfo: {
          filename: "somefile",
          mimetype: "application/json",
          encoding: "utf-8"
        }
      };
      const file = new File({ localPath: "foo", typedValue });

      // then
      expect(file).toMatchSnapshot();
    });

    it("should create instance with proper values", () => {
      // given
      const options = {
        filename: "somefile",
        mimetype: "application/json",
        encoding: "utf-8",
        localPath: "foo"
      };

      const file = new File(options);

      // then
      expect(file).toMatchSnapshot();
    });
  });

  describe("load", () => {
    it("should load content from remotePath when it's provided", async () => {
      // given
      const engineService = {
        get: jest.fn().mockImplementation(() => Promise.resolve(""))
      };
      const remotePath = "some/remote/path";
      const expectedBuffer = Buffer.from(
        await engineService.get(this.remotePath),
        "base64"
      );
      const file = await new File({ remotePath, engineService }).load();

      // then
      expect(file.content).toEqual(expectedBuffer);
    });

    it("should load content from localPath when it's provided", async () => {
      // given
      const localPath = "some/local/path";
      let file = await new File({ localPath });
      file.__readFile = jest.fn().mockImplementation(() => {
        return Promise.resolve("some content");
      });
      const expectedContent = "some content";
      file = await file.load();
      const content = file.content;

      // then
      expect(content).toBe(expectedContent);
    });
  });

  describe("createTypedValue", () => {
    it("should create typedValue with provided parameters", async () => {
      // given
      const valueInfo = {
        filename: "somefile",
        mimetype: "application/text",
        encoding: "utf-8"
      };
      const expectedTypedValue = {
        value: Buffer.from("this some random value").toString("base64"),
        type: "file",
        valueInfo
      };
      const engineService = {
        get: jest
          .fn()
          .mockImplementation(() => Promise.resolve(expectedTypedValue.value))
      };
      const remotePath = "some/remote/path";
      const file = await new File({
        remotePath,
        engineService,
        ...valueInfo
      }).load();

      // then
      expect(file.createTypedValue()).toEqual(expectedTypedValue);
    });
  });
});
