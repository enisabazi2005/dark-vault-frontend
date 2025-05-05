import React, { useState, useEffect } from "react";
import { useStore } from "../../Store/store";
import api from "../../api";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../Pro/Pro.css";

const Pro = ({ chartType = "bar" }) => {
  const { myProfile, friends } = useStore();
  const [proData, setProData] = useState([]);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.online === 1 ||
      friend.away === 1 ||
      friend.do_not_disturb === 1 ||
      friend.offline === 1
  );

  const onlineCount = filteredFriends.filter(
    (friend) => friend.online === 1
  ).length;
  const awayCount = filteredFriends.filter(
    (friend) => friend.away === 1
  ).length;
  const doNotDisturbCount = filteredFriends.filter(
    (friend) => friend.do_not_disturb === 1
  ).length;
  const offlineCount = filteredFriends.filter(
    (friend) => friend.offline === 1
  ).length;

  useEffect(() => {
    if (!myProfile || !friends) return;

    const fetchProVersion = async () => {
      try {
        const response = await api.get("/pro/latest");
        setProData(response.data);
      } catch (error) {
        console.error(error, "error fetching pro version data");
      }
    };

    fetchProVersion();
  }, [myProfile]);

  const chartData = [
    { name: "Feature A", value: 400 },
    { name: "Feature B", value: 300 },
    { name: "Feature C", value: 200 },
    { name: "Feature D", value: 278 },
    { name: "Feature E", value: 189 },
  ];

  const data = [
    { name: "Online", value: onlineCount },
    { name: "Away", value: awayCount },
    { name: "DND", value: doNotDisturbCount },
    { name: "Offline", value: offlineCount },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="pro-version-container">
      {chartType === "bar" && (
        <>
          <div className="pro-version-responsive-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart width={150} height={40} data={chartData}>
                <Bar dataKey="value" fill="#8884d8" />
                <Tooltip />
                <XAxis dataKey="name" hide />
                <YAxis hide />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pro-total-friends-tracker">Total Hours Spent: 10</div>
        </>
      )}

      {chartType === "pie" && (
        <>
          <div className="pro-piechart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="30%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pro-total-completed-tasks">
              Friends: {friends.length}
            </div>
            <div className="status-legend">
              <div className="status-legend-grid">
                {data.map((item, index) => (
                  <div key={index} className="status-item">
                    <div
                      className="status-color-box"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="status-name">
                      {item.name} - {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Pro;
