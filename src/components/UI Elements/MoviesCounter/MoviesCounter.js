import React from 'react';

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import RemoveRedEye from '@material-ui/icons/RemoveRedEye';
import RemoveRedEyeOutlined from '@material-ui/icons/RemoveRedEyeOutlined';
import Zoom from '@material-ui/core/Zoom';

import { withStyles } from '@material-ui/core/styles';
import './MoviesCounter.css';

const StyledIconButton = withStyles({ root: { color: 'white' } })(IconButton);
const StyledTooltip = withStyles({ tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' }, tooltipPlacementBottom: { marginTop: '0px' } })(Tooltip);

export default ({ unseenCounter, watchedCounter }) => {
    return (
        <div id="moviesCounter">
            {unseenCounter > 0 && <StyledTooltip title="Total unseen movies" disableFocusListener disableTouchListener TransitionComponent={Zoom}>
                <StyledIconButton>
                    <Badge badgeContent={unseenCounter} color="secondary">
                        <RemoveRedEyeOutlined fontSize="default" />
                    </Badge>
                </StyledIconButton>
            </StyledTooltip>}
            {watchedCounter > 0 && <StyledTooltip title="Total watched movies" disableFocusListener disableTouchListener TransitionComponent={Zoom}>
                <StyledIconButton>
                    <Badge badgeContent={watchedCounter} color="secondary">
                        <RemoveRedEye fontSize="default" />
                    </Badge>
                </StyledIconButton>
            </StyledTooltip>}
        </div>
    );
};