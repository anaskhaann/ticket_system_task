import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ArrowUpDown } from "lucide-react";
import { API_URL } from "../config/api";

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateSort, setDateSort] = useState("none");
  const [slaWarnings, setSlaWarnings] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const metricsRes = await axios.get(`${API_URL}/api/dashboard`, config);
        setMetrics(metricsRes.data);

        const ticketsRes = await axios.get(`${API_URL}/api/tickets`, config);
        setTickets(ticketsRes.data);
        setFilteredTickets(ticketsRes.data);

        const warnings = ticketsRes.data.filter((ticket) => {
          if (
            !ticket.resolutionDate ||
            ticket.status === "Resolved" ||
            ticket.status === "Closed"
          ) {
            return false;
          }
          const now = new Date();
          const slaDate = new Date(ticket.resolutionDate);
          const hoursRemaining = (slaDate - now) / (1000 * 60 * 60);
          return hoursRemaining <= 24 && hoursRemaining > 0;
        });
        setSlaWarnings(warnings);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [user.token]);

  useEffect(() => {
    let filtered = tickets;

    if (categoryFilter !== "All") {
      filtered = filtered.filter(
        (ticket) => ticket.category === categoryFilter
      );
    }

    if (priorityFilter !== "All") {
      filtered = filtered.filter(
        (ticket) => ticket.priority === priorityFilter
      );
    }

    if (dateSort === "asc") {
      filtered = [...filtered].sort((a, b) => {
        if (!a.resolutionDate) return 1;
        if (!b.resolutionDate) return -1;
        return new Date(a.resolutionDate) - new Date(b.resolutionDate);
      });
    } else if (dateSort === "desc") {
      filtered = [...filtered].sort((a, b) => {
        if (!a.resolutionDate) return 1;
        if (!b.resolutionDate) return -1;
        return new Date(b.resolutionDate) - new Date(a.resolutionDate);
      });
    }

    setFilteredTickets(filtered);
  }, [categoryFilter, priorityFilter, dateSort, tickets]);

  if (!metrics) return <div>Loading...</div>;

  return (
    <Layout>
      <h2 className="text-3xl font-bold tracking-tight mb-6">
        Admin Dashboard
      </h2>

      {(slaWarnings.length > 0 || metrics.breachedTickets > 0) && (
        <Card className="mb-6 border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              SLA Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.breachedTickets > 0 && (
                <div className="text-red-600 font-semibold">
                  {metrics.breachedTickets} ticket(s) have BREACHED SLA
                  deadline!
                </div>
              )}
              {slaWarnings.length > 0 && (
                <div className="text-yellow-700">
                  {slaWarnings.length} ticket(s) approaching SLA deadline
                  (within 24 hours)
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.openTickets}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.inProgressTickets}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved/Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.resolvedTickets + metrics.closedTickets}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-500">
              SLA Breached
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {metrics.breachedTickets}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter & Sort Tickets</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-50">
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sort by Resolution Date
            </Label>
            <Select value={dateSort} onValueChange={setDateSort}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-50">
                <SelectItem value="none">No Sorting</SelectItem>
                <SelectItem value="asc">Earliest First</SelectItem>
                <SelectItem value="desc">Latest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">
          All Tickets ({filteredTickets.length})
        </h3>
        {(categoryFilter !== "All" ||
          priorityFilter !== "All" ||
          dateSort !== "none") && (
          <div className="text-sm text-gray-500">
            Filters active:{" "}
            {[
              categoryFilter !== "All" && `Category: ${categoryFilter}`,
              priorityFilter !== "All" && `Priority: ${priorityFilter}`,
              dateSort !== "none" &&
                `Sorted by date: ${dateSort === "asc" ? "Earliest" : "Latest"}`,
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredTickets.map((ticket) => {
          const isSLABreached =
            ticket.resolutionDate &&
            ticket.status !== "Resolved" &&
            ticket.status !== "Closed" &&
            new Date() > new Date(ticket.resolutionDate);

          const isSLAWarning =
            ticket.resolutionDate &&
            ticket.status !== "Resolved" &&
            ticket.status !== "Closed" &&
            !isSLABreached &&
            (new Date(ticket.resolutionDate) - new Date()) / (1000 * 60 * 60) <=
              24;

          return (
            <Link key={ticket._id} to={`/tickets/${ticket._id}`}>
              <Card
                className={`hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer group relative ${
                  isSLABreached
                    ? "border-red-500 border-2"
                    : isSLAWarning
                    ? "border-yellow-500 border-2"
                    : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-lg">
                          {ticket.title}
                        </div>
                        {isSLABreached && (
                          <Badge className="bg-red-600">SLA BREACHED</Badge>
                        )}
                        {isSLAWarning && (
                          <Badge className="bg-yellow-600">SLA WARNING</Badge>
                        )}
                        <Badge variant="outline" className="ml-2">
                          {ticket.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                        <div>
                          <span className="font-medium">Created by:</span>{" "}
                          {ticket.user ? ticket.user.name : "Unknown User"}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>{" "}
                          {ticket.category}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Updated:</span>{" "}
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </div>
                        {ticket.resolutionDate && (
                          <div>
                            <span className="font-medium">SLA Deadline:</span>{" "}
                            {new Date(
                              ticket.resolutionDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                        {ticket.lastUpdatedBy && (
                          <div>
                            <span className="font-medium">
                              Last updated by:
                            </span>{" "}
                            {ticket.lastUpdatedBy.name || "Admin"}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className="ml-4">{ticket.status}</Badge>
                  </div>
                </CardContent>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="bg-black/75 text-white px-3 py-1 rounded text-sm">
                    Click to see details
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tickets found with current filters.
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
