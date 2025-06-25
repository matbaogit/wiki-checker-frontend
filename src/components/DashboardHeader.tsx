
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Crown, User } from 'lucide-react';

interface DashboardHeaderProps {
  username: string;
  isAdmin: boolean;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, isAdmin, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Công cụ kiểm tra bài viết Wiki
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-600">
              Xin chào, <span className="font-medium">{username}</span>
            </p>
            <Badge variant={isAdmin ? "default" : "secondary"} className="flex items-center gap-1">
              {isAdmin ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {isAdmin ? 'Admin' : 'User'}
            </Badge>
          </div>
        </div>
        <Button 
          onClick={onLogout}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
