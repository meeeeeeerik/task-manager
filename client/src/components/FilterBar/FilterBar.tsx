import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  InputAdornment,
  AvatarGroup,
  Avatar,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { observer } from 'mobx-react-lite';

import { boardStore } from '../../stores/boardStore';
import { PRIORITY_CONFIG } from '../../theme';

const FilterBar = observer(function FilterBar() {
  const { filterPriority, filterAssignee, searchQuery, hasActiveFilters } = boardStore;
  const members = boardStore.activeBoard?.members ?? [];

  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
      <TextField
        size="small"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => boardStore.setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ width: 200, '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
      />

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={filterPriority}
          label="Priority"
          onChange={(e) => boardStore.setFilterPriority(e.target.value)}
          sx={{ borderRadius: 8 }}
        >
          <MenuItem value="all">All</MenuItem>

          {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
            <MenuItem key={p} value={p}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: PRIORITY_CONFIG[p].color,
                  }}
                />
                {PRIORITY_CONFIG[p].label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {members.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Assignee</InputLabel>
          <Select
            value={filterAssignee}
            label="Assignee"
            onChange={(e) => boardStore.setFilterAssignee(e.target.value)}
            sx={{ borderRadius: 8 }}
          >
            <MenuItem value="all">All members</MenuItem>

            {members.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={m.avatar}
                    sx={{ width: 22, height: 22, fontSize: 10, backgroundColor: m.color }}
                  >
                    {m.name[0]}
                  </Avatar>
                  {m.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {hasActiveFilters && (
        <Button
          size="small"
          startIcon={<ClearIcon />}
          onClick={boardStore.clearFilters}
          color="error"
          variant="outlined"
          sx={{ borderRadius: 8 }}
        >
          Clear
        </Button>
      )}

      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AvatarGroup
          max={5}
          sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 11, fontWeight: 700 } }}
        >
          {members.map((m) => (
            <Tooltip key={m.id} title={m.name}>
              <Avatar src={m.avatar} sx={{ backgroundColor: m.color }}>
                {m.name[0]}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
      </Box>
    </Box>
  );
});

export { FilterBar };
