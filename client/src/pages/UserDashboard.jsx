// This file is similar to Admin Dashboard but tailored for regular users to view and manage their tickets.
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { API_URL } from "../config/api";

// User Dashboard: Display user's tickets with filtering options
const UserDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(`${API_URL}/api/tickets`, config);
        setTickets(data);
        setFilteredTickets(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTickets();
  }, [user.token]);

  useEffect(() => {
    if (categoryFilter === "All") {
      setFilteredTickets(tickets);
    } else {
      setFilteredTickets(
        tickets.filter((ticket) => ticket.category === categoryFilter)
      );
    }
  }, [categoryFilter, tickets]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-500";
      case "In Progress":
        return "bg-yellow-500";
      case "Resolved":
        return "bg-green-500";
      case "Closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">My Tickets</h2>
        <Link to="/create-ticket">
          <Button>Create New Ticket</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Label>Filter by Category</Label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" className="z-50">
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Hardware">Hardware</SelectItem>
            <SelectItem value="Software">Software</SelectItem>
            <SelectItem value="Network">Network</SelectItem>
            <SelectItem value="Access">Access</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTickets.map((ticket) => (
          <Link key={ticket._id} to={`/tickets/${ticket._id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full group relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {ticket.category}
                </CardTitle>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">
                  {ticket.title}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {ticket.description}
                </p>
                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <div>
                    Created: {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-black/75 text-white px-3 py-1 rounded text-sm">
                  Click to see details
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tickets found
          {categoryFilter !== "All" ? ` in ${categoryFilter} category` : ""}.
        </div>
      )}
    </Layout>
  );
};

export default UserDashboard;
