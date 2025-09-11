import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const UnifiedNotifications: React.FC = () => {
  const [notifications] = React.useState([]);

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
          >
            {notifications.length}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default UnifiedNotifications;