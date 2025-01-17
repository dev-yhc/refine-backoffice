import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface TierContent {
  tierId: number
  tvingContentCode: string
  pipContentCode: string
  name: string
}

interface TierContentResponse {
  code: string
  message: string
  detailMessage: string
  data: {
    totalCount: number
    list: TierContent[]
  }
}

interface Content {
  order: number
  tvingContentCode: string
  pipContentCode: string
  name: string
  tierName: string
  tierPrice: number
  contentTypeNm: string
  gradeNm: string
  gradeKindNm: string
  tvingExclusiveType: string | null
  broadcastStartDate: number
  broadcastEndDate: number | null
  broadcastWeekdays: string
  releaseStatus: string
  isIncludedTier: boolean
}

interface ApiResponse {
  code: string
  message: string
  detailMessage: string
  data: {
    date: number
    totalCount: number
    list: Content[]
  }
}

export const AdProductPage = () => {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState('1')
  const pageSize = 20
  const [selectedContents, setSelectedContents] = useState<string[]>([])
  const queryClient = useQueryClient()

  const fetchTierContents = async (tierId: string): Promise<TierContentResponse> => {
    const response = await axios.get(
      `https://ex-mtapi-qa.aws.tving.com/v1/internal/ads/tiers/${tierId}/included-contents?pageNo=1&pageSize=20`,
      {
        headers: {
          accept: 'application/json',
          adminId: 'adminId'
        }
      }
    )
    return response.data
  }

  const fetchContents = async (pageNo: number): Promise<ApiResponse> => {
    const response = await axios.get(
      `https://ex-mtapi-qa.aws.tving.com/v1/internal/ads/tiers/contents?tierId=${selectedTier}&pageNo=${pageNo}&pageSize=${pageSize}`,
      {
        headers: {
          accept: 'application/json',
          adminId: 'adminId'
        }
      }
    )
    return response.data
  }

  const includeContentsMutation = useMutation({
    mutationFn: (contentCodes: string[]) =>
      axios.post(
        `https://ex-mtapi-qa.aws.tving.com/v1/internal/ads/tiers/${selectedTier}/included-contents`,
        {
          inclusions: contentCodes,
          exclusions: []
        },
        {
          headers: {
            accept: 'application/json',
            adminId: 'adminId',
            'Content-Type': 'application/json'
          }
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tierContents', selectedTier] })
      toast.success("Contents have been added to the tier.")
      setSelectedContents([])
    },
    onError: (error) => {
      toast.error("Failed to add contents to the tier.")
      console.error('Error including contents:', error)
    }
  })

  const { data: tierData, isLoading: tierLoading, isError: tierError } = useQuery<TierContentResponse, Error>({
    queryKey: ['tierContents', selectedTier],
    queryFn: () => fetchTierContents(selectedTier),
  })

  const { data, isLoading, isError } = useQuery<ApiResponse, Error>({
    queryKey: ['contents', selectedTier, page],
    queryFn: () => fetchContents(page),
  })

  const handleTierChange = (value: string) => {
    setSelectedTier(value)
    setPage(1)
  }

  const handleContentSelect = (contentCode: string) => {
    setSelectedContents(prev =>
      prev.includes(contentCode)
        ? prev.filter(code => code !== contentCode)
        : [...prev, contentCode]
    )
  }

  const handleIncludeContents = () => {
    if (selectedContents.length > 0) {
      includeContentsMutation.mutate(selectedContents)
    }
  }

  const filteredContents = data?.data.list.filter(
    content => 
      content.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.tvingContentCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <>
      <Toaster position="top-right" />
      <div className="container h-screen p-4 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">RTB Video Content Management</h1>

        <div className="flex gap-4 h-full">
          {/* Left Container: Tier Information */}
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Tier Information</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="mb-4">
                <Select onValueChange={handleTierChange} value={selectedTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-md">
                    <SelectItem value="1">Tier 1</SelectItem>
                    <SelectItem value="2">Tier 2</SelectItem>
                    <SelectItem value="3">Tier 3</SelectItem>
                    <SelectItem value="4">Non-Tier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div>
                  {tierLoading ? (
                    <p>Loading tier contents...</p>
                  ) : tierError ? (
                    <p>Error loading tier contents</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>티빙컨텐츠코드</TableHead>
                          <TableHead>PIP 코드</TableHead>
                          <TableHead>컨텐츠명</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tierData?.data.list.map((content) => (
                          <TableRow key={content.tvingContentCode}>
                            <TableCell>{content.tvingContentCode}</TableCell>
                            <TableCell>{content.pipContentCode}</TableCell>
                            <TableCell>{content.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Container: Content Table */}
          <Card className="flex-2 flex flex-col">
            <CardHeader>
              <CardTitle>Content List</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="mb-4 flex justify-between items-center">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  onClick={handleIncludeContents}
                  disabled={selectedContents.length === 0 || includeContentsMutation.isPending}
                >
                  Include Selected Contents
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">Error loading data</TableCell>
                    </TableRow>
                  ) : (
                    filteredContents.map(content => (
                      <TableRow key={content.tvingContentCode}>
                        <TableCell>
                          <Checkbox
                            checked={selectedContents.includes(content.tvingContentCode)}
                            onCheckedChange={() => handleContentSelect(content.tvingContentCode)}
                          />
                        </TableCell>
                        <TableCell>{content.order}</TableCell>
                        <TableCell>{content.name}</TableCell>
                        <TableCell>{content.tierName}</TableCell>
                        <TableCell>{content.tierPrice.toLocaleString()}</TableCell>
                        <TableCell>{content.contentTypeNm}</TableCell>
                        <TableCell>{content.gradeNm}</TableCell>
                        <TableCell>{content.releaseStatus}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span>Page {page}</span>
                <Button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data || data.data.list.length < pageSize}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

