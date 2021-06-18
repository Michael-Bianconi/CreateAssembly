type KeyTypes = number | string;

export default class TwoWayMap {

    private readonly keyToValue: Record<KeyTypes, KeyTypes>;
    private readonly valueToKey: Record<KeyTypes, KeyTypes>;

    constructor(initialValues: Record<KeyTypes, KeyTypes>) {
        this.keyToValue = initialValues;
        this.valueToKey = TwoWayMap.flip(initialValues);
    }

    public insert(key: KeyTypes, value: KeyTypes): void {
        this.keyToValue[key] = value;
        this.valueToKey[value] = key;
    }

    public getValue(key: KeyTypes): KeyTypes {
        return this.keyToValue[key];
    }

    public getKey(value: KeyTypes): KeyTypes {
        return this.valueToKey[value];
    }

    private static flip(record: Record<KeyTypes, KeyTypes>): Record<KeyTypes, KeyTypes> {
        let result: Record<KeyTypes, KeyTypes> = {};
        for (let key in record) {
            if (record.hasOwnProperty(key)) {
                result[record[key]] = key;
            }
        }
        return result;
    }
}