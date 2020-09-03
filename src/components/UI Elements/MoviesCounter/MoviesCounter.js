import React from 'react';

import { Tooltip, IconButton, Badge, Zoom } from '@material-ui/core';
import { RemoveRedEye, RemoveRedEyeOutlined } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const StyledIconButton = withStyles({ root: { color: 'white' } })(IconButton);
const StyledTooltip = withStyles({
    tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' },
    tooltipPlacementBottom: { marginTop: '0px' },
})(Tooltip);

export default ({ unseenCounter = 0, watchedCounter = 0 }) => (
    <div id="moviesCounter">
        <StyledTooltip
            title="Total unseen movies"
            disableFocusListener
            disableTouchListener
            TransitionComponent={Zoom}
        >
            <StyledIconButton>
                <Badge badgeContent={unseenCounter} color="secondary">
                    <RemoveRedEyeOutlined fontSize="default" />
                </Badge>
            </StyledIconButton>
        </StyledTooltip>

        <StyledTooltip
            title="Total watched movies"
            disableFocusListener
            disableTouchListener
            TransitionComponent={Zoom}
        >
            <StyledIconButton>
                <Badge badgeContent={watchedCounter} color="secondary">
                    <RemoveRedEye fontSize="default" />
                </Badge>
            </StyledIconButton>
        </StyledTooltip>
    </div>
);
