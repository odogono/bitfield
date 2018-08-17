export class BitField {
    private isAllSet: boolean = false;

    private values: Array<number> = [];

    /**
     * Returns true if the passed instance is a BitField
     */
    static isBitField(value: any): boolean {
        return value instanceof BitField;
    }

    /**
     * Static initializer
     */
    static create(values?: BitField | Array<number> | string): BitField {
        return new BitField(values);
    }

    /**
     * Creates a new instance of the BitField
     */
    constructor(values?: BitField | Array<number> | string) {
        if (values === undefined) {
            return;
        }
        
        this.set( values, true );

        // } else if (Array.isArray(values)) {
        //     this.setValues(values, true);
        // } else if( BitField.isBitField(values) ){
        //     this.set( (<BitField>values) );
        // } else if (typeof values === 'string') {
        //     if (values === 'all') {
        //         this.isAllSet = true;
        //     } else {
        //         let parts: string[] = values.split('');
        //         for (
        //             let ii = parts.length - 1, len = parts.length - 1;
        //             ii >= 0;
        //             ii--
        //         ) {
        //             this.set(len - ii, parts[ii] === '1');
        //         }
        //     }
        // }
    }

    /**
     * Returns a new instance with the same values as this one
     */
    clone(): BitField {
        let result = new BitField();
        result.setValues(this.toValues());
        return result;
    }

    /**
     * Clears all values from the BitField
     */
    reset() {
        this.values = [];
        this.isAllSet = false;
    }

    /**
     * Returns the number of bits
     */
    size(): number {
        return this.values.length * 32;
    }

    /**
     * Returns the value of the bit at the given position
     */
    get(index: number, values?: Array<number>): boolean {
        if (this.isAllSet) {
            return true;
        }
        values = values || this.values;
        let ii: number = (index / 32) | 0; // | 0 converts to an int. Math.floor works too.
        let bit: number = index % 32;
        return (values[ii] & (1 << bit)) !== 0;
    }



    /**
     * Sets a bit at the given index to the given value
     * An array of positions can also be passed, as well as a BitField instance
     */
    set(index: number | string | Array<number> | BitField, value: boolean = true) {
        this.isAllSet = false;

        if( typeof index === 'number' ){
            let partIndex: number = (<number>index / 32) | 0;
            let bit: number = <number>index % 32;
    
            if (value) {
                this.values[partIndex] |= 1 << bit;
            } else {
                this.values[partIndex] &= ~(1 << bit);
            }
        }
        
        else if( typeof index === 'string' ){
            if (index === 'all') {
                this.isAllSet = true;
            } else {
                let parts: string[] = index.split('');
                for (
                    let ii = parts.length - 1, len = parts.length - 1;
                    ii >= 0;
                    ii--
                ) {
                    this.set(len - ii, parts[ii] === '1');
                }
            }
        }

        else if( Array.isArray(index) ){
            return this.setValues( index, value );
        }

        else if (BitField.isBitField(index)) {
            return this.setValues((<BitField>index).toValues(), true);
        }
    }

    /**
     * Sets the given positions to the specified value which defaults to true
     */
    setValues(values: Array<number>, value: boolean = true) {
        this.isAllSet = false;
        if( values === null ){
            this.isAllSet = value;
            return;
        }
        for (let ii = 0, len = values.length; ii < len; ii++) {
            this.set(values[ii], value);
        }
        return this;
    }

    /**
     * Outputs an array of positions at which the values are true
     */
    toValues(values?: Array<number>): Array<number> {
        let result: Array<number> = [];
        if (values === undefined) {
            values = this.values;
        }

        for (let ii = 0, len = values.length * 32; ii < len; ii++) {
            if (this.get(ii, values)) {
                result.push(ii);
            }
        }
        return result;
    }

    /**
     * Returns the number of bits set to true
     */
    count(values?: Array<number>): number {
        values = values || this.values;
        if (this.isAllSet) {
            return Number.MAX_VALUE;
        }
        if (this.values.length === 0) {
            return 0;
        }

        let count: number = 0;

        for (let ii = 0, len = values.length; ii < len; ii++) {
            // See: http://bits.stephan-brumme.com/countBits.html for an explanation
            let x = values[ii];

            if (x === 0) {
                continue;
            }
            x = x - ((x >> 1) & 0x55555555);
            x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
            x = x + (x >> 4);
            x &= 0xf0f0f0f;

            count += (x * 0x01010101) >> 24;
        }
        return count;
    }

    /**
     * Returns true if this BitField is the same as the other
     */
    equals(other: BitField): boolean {
        if (this.isAllSet === true && other.isAllSet === true) {
            return true;
        }

        for (let ii = 0, len = this.values.length; ii < len; ii++) {
            let a = this.values[ii];
            let b = other.values[ii];
            a = a === undefined ? 0 : a;
            b = b === undefined ? 0 : b;
            if (a !== b) {
                return false;
            }
        }
        return true;
    }

    /**
     * Bitwise AND - returns false if one bit is true when the other is false
     */
    static and(a : BitField, b : BitField ) : boolean {
        // return a.and(null, b);
        // var i, l, values, ovalues;
        
        if (a.isAllSet && b.isAllSet) {
            return true;
        }
        if (a.values.length === 0 && b.values.length === 0) {
            return false;
        }
    
        let values = a.values;
        let ovalues = b.values;
    
        for (let ii = 0, len = values.length; ii < len; ii++) {
            if (values[ii] === undefined) {
                continue;
            }
            if ((values[ii] & ovalues[ii]) !== values[ii]) {
                return false;
            }
        }
        return true;
    };

    /**
     * Bitwise OR - returns true if any matching bits are true
     * (previously aand)
     */
    static or(a : BitField, b : BitField) : boolean{
        
        if (a.isAllSet && b.isAllSet) {
            return true;
        }
        if (a.values.length === 0 && b.values.length === 0) {
            return false;
        }
    
        let values = a.values;
        let ovalues = b.values;
        let result : boolean = false;
    
        for (let ii = 0, len = values.length; ii < len; ii++) {
            // if( values[i] === undefined )
            //     continue;
            // if( d ){ console.log( i + ' bfOR ' + values[i] + ' ' + ovalues[i] + ' ' + (values[i] & ovalues[i]) ); }
            if ((values[ii] & ovalues[ii]) !== 0) {
                return true;
            }
        }
    
        return result;
    };


    /**
     * Bitwise NOR
     */
    static nor(a : BitField, b : BitField) : boolean {
        if (a.isAllSet || b.isAllSet) {
            return false;
        }
        if (a.values.length === 0 && b.values.length === 0) {
            return true;
        }
    
        let values = a.values;
        let ovalues = b.values;
    
        for (let ii = 0, len = values.length; ii < len; ii++) {
            if ((values[ii] & ovalues[ii]) !== 0) {
                return false;
            }
        }
        return true;
    };

    /**
     *   If no results instance is passed the function returns true
     *   if the two bitfields pass the AND
     *
     *   if equals is passed the result is (a&b) == a
     */
    and(result: BitField | null, other: BitField, equals?: BitField) : boolean | BitField {
        if (this.isAllSet || other.isAllSet) {
            return true;
        }

        let out: Array<number> = result ? result.values : [];
        let values: Array<number> = this.values;
        let ovalues: Array<number> = other.values;
        let evalues: Array<number> = equals ? equals.values : [];
        let eq = true;

        for (let ii = 0, len = values.length; ii < len; ii++) {
            out[ii] = values[ii] & ovalues[ii];
            if (equals && eq) {
                eq = out[ii] === evalues[ii];
            } else if (eq) {
                eq = out[ii] === 0;
            }
        }
        if (equals) {
            return eq;
        }
        if (result) {
            return result;
        }
        return !eq;
    }

    /**
     * Returns the values in <other> which are not present in <this>
     * If result is passed, the result is placed in that
     */
    difference(result: BitField | null, other: BitField): BitField {
        result = result || new BitField();

        let values: Array<boolean> = this.toArray();
        let ovalues: Array<boolean> = other.toArray();

        for (let ii = 0, len = values.length; ii < len; ii++) {
            // console.log('consider this', ii, values[ii] );
            // console.log('consider that', ii, ovalues[ii] );
            if (ovalues[ii] === true && values[ii] === false) {
                result.set(values.length - ii - 1, true);
            }
        }

        return result;
    }

    /**
     * Returns an array representation of each bit represented as a boolean
     */
    toArray(values?: Array<number>) : Array<boolean> {
        if (this.isAllSet) {
            return [];
        }
        let found: boolean = false;
        let result: Array<boolean> = [];

        if (values === undefined) {
            values = this.values;
        }

        for (let ii = values.length * 32 - 1; ii >= 0; ii--) {
            let v: boolean = this.get(ii, values);
            if (!found) {
                found = v;
            }
            if (found) {
                result.push(v);
            }
        }
        return result;
    }

    /**
     * Returns a JSON representation
     */
    toJSON(): string | Array<number> {
        if (this.isAllSet) {
            return 'all';
        }
        return this.toValues();
    }

    /**
     * Returns a binary string representation of the BitField
     */
    toString(values?: Array<number>): string {
        if (this.isAllSet) {
            return 'all';
        }
        if (this.values.length === 0) {
            return '0';
        }
        return this.toArray(values)
            .map(value => (value ? '1' : '0'))
            .join('');
    }
}






