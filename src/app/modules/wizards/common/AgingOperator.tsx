import {  GridFilterInputValueProps,GridFilterItem,GridFilterOperator,} from "@mui/x-data-grid-pro";
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField, { TextFieldProps } from '@mui/material/TextField';

const SUBMIT_FILTER_STROKE_TIME = 500;

function InputNumberInterval(props: GridFilterInputValueProps) {
    const { item, applyValue, focusElementRef = null } = props;

    const filterTimeout = React.useRef<any>();
    const [filterValueState, setFilterValueState] = React.useState<[string, string]>(
        item.value ?? '',
    );
    const [applying, setIsApplying] = React.useState(false);

    React.useEffect(() => {
        return () => {
            clearTimeout(filterTimeout.current);
        };
    }, []);

    React.useEffect(() => {
        const itemValue = item.value ?? [undefined, undefined];
        setFilterValueState(itemValue);
    }, [item.value]);

    const updateFilterValue = (lowerBound: string, upperBound: string) => {
        clearTimeout(filterTimeout.current);
        setFilterValueState([lowerBound, upperBound]);

        setIsApplying(true);
        filterTimeout.current = setTimeout(() => {
            setIsApplying(false);
            applyValue({ ...item, value: [lowerBound, upperBound] });
        }, SUBMIT_FILTER_STROKE_TIME);
    };

    const handleUpperFilterChange: TextFieldProps['onChange'] = (event) => {
        const newUpperBound = event.target.value;
        updateFilterValue(filterValueState[0], newUpperBound);
    };
    const handleLowerFilterChange: TextFieldProps['onChange'] = (event) => {
        const newLowerBound = event.target.value;
        updateFilterValue(newLowerBound, filterValueState[1]);
    };

    return (
        <Box
            sx={{
                display: 'inline-flex',
                flexDirection: 'row',
                alignItems: 'end',
                height: 48,
                pl: '20px',
            }}
        >
            <TextField
                name="lower-bound-input"
                placeholder="From"
                label="From"
                variant="standard"
                value={Number(filterValueState[0])}
                onChange={handleLowerFilterChange}
                type="number"
                inputRef={focusElementRef}
                sx={{ mr: 2 }}
            />
            <TextField
                name="upper-bound-input"
                placeholder="To"
                label="To"
                variant="standard"
                value={Number(filterValueState[1])}
                onChange={handleUpperFilterChange}
                type="number"
            />
        </Box>
    );
}

const AgingOperators: GridFilterOperator[] = [

    {
        label: 'Between',
        value: 'between',
        getApplyFilterFn: (filterItem: GridFilterItem) => {
            if (!Array.isArray(filterItem.value) || filterItem.value.length !== 2) {
                return null;
            }
            if (filterItem.value[0] == null || filterItem.value[1] == null) {
                return null;
            }

            return ({ value }) => {
                return (
                    value !== null &&
                    filterItem.value[0] <= value &&
                    value <= filterItem.value[1]
                );
            };
        },
        InputComponent: InputNumberInterval,
    },

];

export { AgingOperators }